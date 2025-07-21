import axiosPkg from 'axios';
const { default: axios } = axiosPkg;
import pRetry from 'p-retry';
import { franc } from 'franc';
import Sentiment from 'sentiment';
import FAQ from '../models/faq.model.js';
import Client from '../models/Client.model.js';
import Commande from '../models/Commande.model.js';
import Confirmer from '../models/Confirmer.model.js';
import productExel from '../models/productExel.model.js';
import Produit from '../models/product.model.js';
import Chat from '../models/Chat.model.js';

class OpenRouterService {
  /**
   * Génère une réponse intelligente et enregistre l'interaction
   * @param {string} prompt - Le message de l'Utilisateur
   * @param {string} userNmb - Le numéro de l'utilisateur (format @c.us)
   * @returns {Promise<string>} - La réponse générée
   */
  static async generateResponse(prompt, userNmb) {
    try {
      // Valider les entrées
      if (!prompt || !userNmb) {
        throw new Error('Prompt ou numéro dutilisateur manquant');
      }

      const userNumber = userNmb.replace('@c.us', '');
      const detectedLanguage = this.detectLanguageWithConfidence(prompt);
      const mainLanguage = detectedLanguage.language;

      // 1. Vérification des salutations (adaptée à la langue détectée)
      const greetingResponse = await this.checkGreetings(prompt, userNumber, mainLanguage);
      if (greetingResponse) {
        await this.saveChatInteraction(userNmb, prompt, greetingResponse, mainLanguage);
        return greetingResponse;
      }

      // 2. Vérification des questions fréquentes (avec détection multilingue)
      const faqResponse = await this.checkFAQ(prompt, mainLanguage);
      if (faqResponse) {
        await this.saveChatInteraction(userNmb, prompt, faqResponse, mainLanguage);
        return faqResponse;
      }

      // 3. Vérification des informations client/commande
      const orderResponse = await this.checkOrderInfo(prompt, userNumber, mainLanguage);
      if (orderResponse) {
        await this.saveChatInteraction(userNmb, prompt, orderResponse, mainLanguage);
        return orderResponse;
      }

      // 4. Vérification des informations produit
      const productResponse = await this.checkProductInfo(prompt, userNumber, mainLanguage);
      if (productResponse) {
        await this.saveChatInteraction(userNmb, prompt, productResponse, mainLanguage);
        return productResponse;
      }

      // 5. Vérification des demandes de recommandation
      const recommendationResponse = await this.checkProductRecommendation(prompt, mainLanguage);
      if (recommendationResponse) {
        await this.saveChatInteraction(userNmb, prompt, recommendationResponse, mainLanguage);
        return recommendationResponse;
      }

      // 6. Génération de réponse via OpenRouter dans la langue détectée
      const aiResponse = await this.generateAIResponse(prompt, mainLanguage);
      await this.saveChatInteraction(userNmb, prompt, aiResponse, mainLanguage);
      return aiResponse;

    } catch (error) {
      console.error('Error in generateResponse:', {
        prompt,
        userNmb,
        message: error.message
      });
      const fallback = this.getFallbackResponse(prompt);
      await this.saveChatInteraction(userNmb, prompt, fallback, this.detectLanguage(prompt));
      return fallback;
    }
  }

  /**
   * Enregistre l'interaction dans la collection Chat
   * @param {string} userNmb - Numéro de l'utilisateur
   * @param {string} prompt - Message de l'utilisateur
   * @param {string} response - Réponse générée
   * @param {string} language - Langue principale de l'interaction
   */
  static async saveChatInteraction(userNmb, prompt, response, language) {
    try {
      const sentiment = this.analyzeSentiment(prompt);

      await Chat.create({
        user: userNmb,
        message: prompt,
        response,
        language,
        sentiment,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving chat interaction:', {
        userNmb,
        prompt,
        response,
        message: error.message
      });
    }
  }

  /**
   * Détecte la langue du prompt avec niveau de confiance
   * @param {string} prompt - Message de l'utilisateur
   * @returns {object} - {language: string, confidence: number}
   */
  static detectLanguageWithConfidence(prompt) {
    try {
      // Version simplifiée et robuste
      const langCode = franc(prompt, {
        only: ['ara', 'fra', 'eng'],
        minLength: 1 // Plus permissif pour les messages courts
      });

      return {
        language: this.mapLanguageCode(langCode),
        confidence: 0.9,
        all: [{ language: this.mapLanguageCode(langCode), score: 0.9 }]
      };
    } catch (error) {
      return {
        language: 'arabic', // Langue par défaut
        confidence: 0,
        all: []
      };
    }
  }

  /**
   * Mappe les codes de langue franc aux noms complets
   */
  static mapLanguageCode(code) {
    const map = {
      'ara': 'arabic',
      'fra': 'french',
      'eng': 'english'
    };
    return map[code] || 'unknown';
  }

  /**
   * Détecte la langue du prompt (version simplifiée)
   */
  static detectLanguage(prompt) {
    const langCode = franc(prompt, { minLength: 3, only: ['ara', 'fra', 'eng'] });
    return this.mapLanguageCode(langCode);
  }

  /**
   * Analyse le sentiment du prompt
   */
  static analyzeSentiment(prompt) {
    try {
      const sentiment = new Sentiment();
      const result = sentiment.analyze(prompt);
      if (result.score > 0.5) return 'positive';
      if (result.score < -0.5) return 'negative';
      return 'neutral';
    } catch (error) {
      return 'neutral';
    }
  }

  /**
   * Gère les salutations en fonction de la langue détectée
   */
  static async checkGreetings(prompt, userNumber, mainLanguage = 'arabic') {
    const lowerPrompt = prompt.toLowerCase().trim();

  // Liste étendue des salutations
    const greetings = {
      arabic: ['salam', 'سلام', 'مرحبا', 'marhaba', 'السلام عليكم', 'اهلا', 'أهلا', 'هلا'],
      french: ['bonjour', 'salut', 'coucou', 'hello', 'hi', 'bonsoir'],
      english: ['hello', 'hi', 'hey', 'good morning', 'good afternoon']
    };

    // Vérification plus robuste
    const isArabic = greetings.arabic.some(g => lowerPrompt.includes(g));
    const isFrench = greetings.french.some(g => lowerPrompt.includes(g));
    const isEnglish = greetings.english.some(g => lowerPrompt.includes(g));

    if (!isArabic && !isFrench && !isEnglish) return null;

    // Déterminez la langue de réponse
    let responseLang = mainLanguage;
    if (isArabic) responseLang = 'arabic';
    else if (isFrench) responseLang = 'french';
    else if (isEnglish) responseLang = 'english';

    // Réponse adaptée
    const now = new Date();
    const hour = now.getHours();

    const responses = {
      arabic: {
        morning: 'صباح الخير 🌟',
        afternoon: 'مساء الخير 🌟',
        evening: 'مساء الخير 🌟',
        default: 'مرحبا 👋'
      },
      french: {
        morning: 'Bonjour 👋',
        afternoon: 'Bon après-midi 👋',
        evening: 'Bonsoir 👋',
        default: 'Bonjour 👋'
      },
      english: {
        morning: 'Good morning 😊',
        afternoon: 'Good afternoon 😊',
        evening: 'Good evening 😊',
        default: 'Hello 👋'
      }
    };

    let timeBasedGreeting = responses[responseLang].default;
    if (hour < 12) timeBasedGreeting = responses[responseLang].morning;
    else if (hour < 18) timeBasedGreeting = responses[responseLang].afternoon;
    else timeBasedGreeting = responses[responseLang].evening;

    // Ajoutez le nom si disponible
    if (userNumber) {
      try {
        const clientInfo = await Client.findOne({ customerPhone: userNumber }).lean();
        if (clientInfo?.customerName) {
          timeBasedGreeting += responseLang === 'arabic'
            ? ` ${clientInfo.customerName}`
            : ` ${clientInfo.customerName}`;
        }
        timeBasedGreeting += responseLang === 'arabic'
          ? '\n\nكيف يمكنني مساعدتك اليوم؟'
          : '\n\nComment puis-je vous aider aujourd\'hui ?';

      } catch (error) {
        console.error('Error fetching client info:', error);
      }
    }

    return timeBasedGreeting;
  }

  /**
   * Vérifie si la question existe dans les FAQ (version multilingue)
   */
  static async checkFAQ(prompt, mainLanguage = 'arabic') {
    try {
      // Normaliser le prompt pour la recherche
      const normalizedPrompt = prompt.toLowerCase().trim();

      // Recherche exacte avec correspondance de langue
      const exactMatch = await FAQ.findOne({
        $or: [
          {
            $and: [
              { question: { $regex: `^${normalizedPrompt}$`, $options: 'i' } },
              { language: mainLanguage }
            ]
          },
          {
            keywords: {
              $elemMatch: {
                keyword: { $in: normalizedPrompt.split(' ') },
                language: mainLanguage
              }
            }
          }
        ]
      }).lean();

      if (exactMatch) return exactMatch.answer;

      // Recherche approximative dans toutes les FAQ
      const allFAQs = await FAQ.find({ language: mainLanguage }).lean();

      // Trouver des questions similaires avec un seuil de similarité
      const similarQuestions = allFAQs.filter(faq =>
        this.isSimilarQuestion(normalizedPrompt, faq.question.toLowerCase(), 0.6)
      );

      // Si une seule question similaire trouvée, retourner sa réponse
      if (similarQuestions.length === 1) {
        return similarQuestions[0].answer;
      }

      // Si plusieurs questions similaires, proposer les plus pertinentes
      if (similarQuestions.length > 1) {
        const languageResponses = {
          arabic: `وجدت عدة أسئلة مشابهة:\n\n${similarQuestions.slice(0, 3).map((q, i) => `${i + 1}. ${q.question}`).join('\n')}\n\nأي من هذه تقصد؟`,
          french: `J'ai trouvé plusieurs questions similaires:\n\n${similarQuestions.slice(0, 3).map((q, i) => `${i + 1}. ${q.question}`).join('\n')}\n\nLaquelle vous intéresse ?`,
          english: `I found several similar questions:\n\n${similarQuestions.slice(0, 3).map((q, i) => `${i + 1}. ${q.question}`).join('\n')}\n\nWhich one are you referring to?`
        };

        return languageResponses[mainLanguage] || languageResponses.arabic;
      }

      return null;
    } catch (error) {
      console.error('Error in checkFAQ:', error);
      return null;
    }
  }

  /**
   * Vérifie les informations de commande (version multilingue)
   */
  static async checkOrderInfo(prompt, userNumber, mainLanguage = 'arabic') {
    try {
      const lowerPrompt = prompt.toLowerCase();

      // Mots-clés multilingues pour les commandes
      const orderKeywords = {
        arabic: ['طلب', 'تتبع', 'شحنة', 'توصيل', 'حالة الطلب', 'رقم التتبع'],
        french: ['commande', 'livraison', 'colis', 'commamd', 'suivi', 'statut', 'numéro de suivi', 'mes commandes'],
        english: ['order', 'delivery', 'package', 'tracking', 'status', 'shipment']
      };

      // Détecter si la question concerne une commande
      const isOrderRelated = orderKeywords[mainLanguage]?.some(keyword =>
        lowerPrompt.includes(keyword)
      ) || false;

      if (!isOrderRelated || !userNumber) return null;

      // Récupérer les commandes du client

      const orders = await Confirmer.aggregate([
        {
          $lookup: {
            from: 'clients',
            localField: 'clientId',
            foreignField: '_id',
            as: 'client'
          }
        },
        { $unwind: '$client' },
        { $match: { 'client.customerPhone': userNumber } },
        {
          $lookup: {
            from: 'commandes',
            localField: 'commandeId',
            foreignField: '_id',
            as: 'commande'
          }
        },
        { $unwind: '$commande' },
        {
          $lookup: {
            from: 'produits',
            localField: 'produitId',
            foreignField: '_id',
            as: 'produit'
          }
        },
        { $unwind: '$produit' },
        { $sort: { 'commande.createdAt': -1 } }
      ]);
      // Réponses multilingues pour aucun résultat
      if (!orders.length) {
        const noOrderResponses = {
          arabic: [
            "لم أتمكن من العثور على أي طلبات مرتبطة برقمك. هل ترغب في إنشاء طلب جديد؟",
            "لا توجد أي طلبات مسجلة لهذا الرقم. هل تحتاج مساعدة في إتمام عملية شراء؟",
            "يبدو أنه ليس لديك أي طلبات نشطة. هل تريد استعراض منتجاتنا المتاحة؟"
          ],
          french: [
            "Je n'ai pas trouvé de commande associée à votre numéro. Souhaitez-vous créer une nouvelle commande ?",
            "Aucune commande trouvée pour votre numéro. Voulez-vous que je vous aide à passer une nouvelle commande ?",
            "Il semble que vous n'avez pas de commande en cours. Puis-je vous aider avec nos produits disponibles ?"
          ],
          english: [
            "I couldn't find any orders associated with your number. Would you like to place a new order?",
            "No orders found for your number. Can I help you create a new order?",
            "It seems you don't have any active orders. Would you like to browse our available products?"
          ]
        };

        return noOrderResponses[mainLanguage][Math.floor(Math.random() * noOrderResponses[mainLanguage].length)];
      }

      // Vérification de demande spécifique de statut
      const statusKeywords = {
        arabic: ['حالة', 'تتبع', 'توصيل'],
        french: ['statut', 'suivi', 'livraison'],
        english: ['status', 'tracking', 'delivery']
      };

      const isStatusRequest = statusKeywords[mainLanguage]?.some(keyword =>
        lowerPrompt.includes(keyword)
      ) || false;

      if (isStatusRequest) {
        // Essayer d'extraire une référence de commande
        const refPatterns = {
          arabic: /(?:رقم|رمز|الطلب)\s*([a-zA-Z0-9]+)/i,
          french: /(?:référence|ref|commande|statut de la commande|commande ref )\s*([a-zA-Z0-9]+)/i,
          english: /(?:reference|ref|order)\s*([a-zA-Z0-9]+)/i
        };

        const refMatch = prompt.match(refPatterns[mainLanguage] || refPatterns.arabic);

        if (refMatch) {
          const ref = refMatch[1];
          const specificOrder = orders.find(o => o.reference.includes(ref));

          if (specificOrder) {
            // Mappage des statuts avec emojis
            const statusMaps = {
              arabic: {
                'assigned': '🛠️ قيد التحضير', // Assigned -> en préparation
                'delivered': '✅ تم التوصيل',  // Delivered -> livré
                'new': '🆕 جديد',             // New -> nouveau
                'out of stock': '⛔ نفذ من المخزن', // Out of stock -> rupture de stock
                'pending': '⏳ قيد الانتظار',  // Pending -> en attente
                'return': '↩️ استرجاع'          // Return -> retour
              },
              french: {
                'assigned': '🛠️ En préparation',
                'delivered': '✅ Livré',
                'new': '🆕 Nouveau',
                'out of stock': '⛔ Rupture de stock',
                'pending': '⏳ En attente',
                'return': '↩️ Retour'
              },
              english: {
                'assigned': '🛠️ In preparation',
                'delivered': '✅ Delivered',
                'new': '🆕 New',
                'out of stock': '⛔ Out of stock',
                'pending': '⏳ Pending',
                'return': '↩️ Return'
        }
            };

            const statusMap = statusMaps[mainLanguage] || statusMaps.arabic;
            const status = statusMap[specificOrder.commande.status?.toLowerCase()] || '🔄 En traitement';

            // Construire la réponse
            let response = {
              arabic: `📦 حالة الطلب ${specificOrder.reference} :\n\n${status}\n`,
              french: `📦 Statut de la commande ${specificOrder.reference} :\n\n${status}\n`,
              english: `📦 Status of order ${specificOrder.reference}:\n\n${status}\n`
            }[mainLanguage];

            if (specificOrder.commande.shippedAt) {
              const dateFormat = new Intl.DateTimeFormat(mainLanguage === 'arabic' ? 'ar-MA' : mainLanguage === 'french' ? 'fr-FR' : 'en-US');
              const shippedDate = dateFormat.format(new Date(specificOrder.commande.shippedAt));

              response += {
                arabic: `📅 تاريخ الشحن: ${shippedDate}\n`,
                french: `📅 Date d'expédition: ${shippedDate}\n`,
                english: `📅 Shipping date: ${shippedDate}\n`
              }[mainLanguage];
        }

            if (specificOrder.commande.deliveredAt) {
              const dateFormat = new Intl.DateTimeFormat(mainLanguage === 'arabic' ? 'ar-MA' : mainLanguage === 'french' ? 'fr-FR' : 'en-US');
              const deliveredDate = dateFormat.format(new Date(specificOrder.commande.deliveredAt));

              response += {
                arabic: `🏡 تاريخ التسليم: ${deliveredDate}\n`,
                french: `🏡 Date de livraison: ${deliveredDate}\n`,
                english: `🏡 Delivery date: ${deliveredDate}\n`
              }[mainLanguage];
            }

            if (specificOrder.commande.trackingNumber) {
              response += {
                arabic: `📦 رقم التتبع: ${specificOrder.commande.trackingNumber}\n`,
                french: `📦 Numéro de suivi: ${specificOrder.commande.trackingNumber}\n`,
                english: `📦 Tracking number: ${specificOrder.commande.trackingNumber}\n`
              }[mainLanguage];
            }

            // Ajouter une question de suivi
            response += {
              arabic: '\nهل تحتاج إلى مزيد من المعلومات حول هذه الطلبية؟',
              french: '\nBesoin de plus d\'informations sur cette commande ?',
              english: '\nDo you need more information about this order?'
            }[mainLanguage];

            return response;
          }
        }
      }

      // Réponse générale avec liste des commandes
      const responseHeaders = {
        arabic: `📦 لديك ${orders.length} طلبية مسجلة:\n\n`,
        french: `📦 Vous avez ${orders.length} commande(s) enregistrée(s) :\n\n`,
        english: `📦 You have ${orders.length} order(s) registered:\n\n`
      };

      let response = responseHeaders[mainLanguage];

      orders.slice(0, 3).forEach((order, index) => {
        const statusMaps = {
          arabic: {
            'assigned': '🛠️ قيد التحضير', // Assigned -> en préparation
            'delivered': '✅ تم التوصيل',  // Delivered -> livré
            'new': '🆕 جديد',             // New -> nouveau
            'out of stock': '⛔ نفذ من المخزن', // Out of stock -> rupture de stock
            'pending': '⏳ قيد الانتظار',  // Pending -> en attente
            'return': '↩️ استرجاع'          // Return -> retour
          },
          french: {
            'assigned': '🛠️ En préparation',
            'delivered': '✅ Livré',
            'new': '🆕 Nouveau',
            'out of stock': '⛔ Rupture de stock',
            'pending': '⏳ En attente',
            'return': '↩️ Retour'
          },
          english: {
            'assigned': '🛠️ In preparation',
            'delivered': '✅ Delivered',
            'new': '🆕 New',
            'out of stock': '⛔ Out of stock',
            'pending': '⏳ Pending',
            'return': '↩️ Return'
          }
        };
        const statusMap = statusMaps[mainLanguage] || statusMaps.arabic;
        const statusEmoji = statusMap[order.commande.status?.toLowerCase()] || '🔄';

        const itemTexts = {
          arabic: [
            `🔹 الطلبية رقم ${index + 1}\n`,
            `📌 المرجع: ${order.reference}\n`,
            `🎁 المنتج: ${order.produit.productName || 'غير محدد'}\n`,
            `الحالة: ${statusEmoji}  (${order.commande.status || 'قيد المعالجة'})\n`
          ],
          french: [
            `🔹 Commande #${index + 1}\n`,
            `📌 Référence: ${order.reference}\n`,
            `🎁 Produit: ${order.produit.productName || 'Non spécifié'}\n`,
            `Statut: ${statusEmoji} (${order.commande.status || 'En traitement'})\n`
          ],
          english: [
            `🔹 Order #${index + 1}\n`,
            `📌 Reference: ${order.reference}\n`,
            `🎁 Product: ${order.produit.productName || 'Not specified'}\n`,
            `Status: ${statusEmoji} (${order.commande.status || 'Processing'})\n`
          ]
        };

        response += itemTexts[mainLanguage].join('');

        if (order.commande.shippedAt) {
          const dateFormat = new Intl.DateTimeFormat(mainLanguage === 'arabic' ? 'ar-MA' : mainLanguage === 'french' ? 'fr-FR' : 'en-US');
          const shippedDate = dateFormat.format(new Date(order.commande.shippedAt));

          response += {
            arabic: `📅 تاريخ الشحن: ${shippedDate}\n`,
            french: `📅 Expédiée le: ${shippedDate}\n`,
            english: `📅 Shipped on: ${shippedDate}\n`
          }[mainLanguage];
        }

        if (order.commande.deliveredAt) {
          const dateFormat = new Intl.DateTimeFormat(mainLanguage === 'arabic' ? 'ar-MA' : mainLanguage === 'french' ? 'fr-FR' : 'en-US');
          const deliveredDate = dateFormat.format(new Date(order.commande.deliveredAt));

          response += {
            arabic: `🏡 تاريخ التسليم: ${deliveredDate}\n`,
            french: `🏡 Livrée le: ${deliveredDate}\n`,
            english: `🏡 Delivered on: ${deliveredDate}\n`
          }[mainLanguage];
        }

        response += '\n';
      });

      if (orders.length > 3) {
        response += {
          arabic: `ℹ️ يوجد ${orders.length - 3} طلبات إضافية. يرجى تقديم المرجع لمزيد من التفاصيل.\n\n`,
          french: `ℹ️ Plus ${orders.length - 3} commande(s) non affichée(s). Dites-moi une référence pour plus de détails.\n\n`,
          english: `ℹ️ ${orders.length - 3} more order(s) not shown. Please provide a reference for details.\n\n`
        }[mainLanguage];
      }

      const suggestions = {
        arabic: [
          "لمزيد من المعلومات حول طلبية محددة، يرجى تقديم رقم المرجع.",
          "هل تحتاج مساعدة بخصوص إحدى هذه الطلبيات؟ فقط أخبرني أي واحدة!",
          "إذا كان لديك أي استفسار حول حالة الطلب، أنا هنا لمساعدتك."
        ],
        french: [
          "Pour plus d'informations sur une commande spécifique, veuillez me donner sa référence.",
          "Besoin d'aide avec l'une de ces commandes ? Dites-moi simplement laquelle !",
          "Si vous avez des questions sur le statut d'une commande, je suis là pour aider."
        ],
        english: [
          "For more information about a specific order, please provide its reference.",
          "Need help with one of these orders? Just tell me which one!",
          "If you have any questions about order status, I'm here to help."
        ]
      };

      return response + suggestions[mainLanguage][Math.floor(Math.random() * suggestions[mainLanguage].length)];
    } catch (error) {
      console.error('Error in checkOrderInfo:', error);
      return null;
    }
  }

  /**
   * Vérifie les informations sur les produits (version multilingue)
   */
  static async checkProductInfo(prompt, userNumber, mainLanguage = 'arabic') {
    try {
      const lowerPrompt = prompt.toLowerCase();

      // Mots-clés multilingues pour les produits
      const productKeywords = {
        arabic: ['منتج', 'كمية', 'إجمالي', 'كيفية', 'استخدام', 'وصف', 'مواصفات', 'سعر'],
        french: ['produit', 'quantité', 'total', 'utiliser', 'comment', 'description', 'spécification', 'prix', 'comment utiliser produit'],
        english: ['product', 'quantity', 'total', 'use', 'how', 'description', 'specification', 'price']
      };

      const isProductRelated = productKeywords[mainLanguage]?.some(keyword =>
        lowerPrompt.includes(keyword)
      ) || false;

      if (!isProductRelated) return null;

      // Recherche dans les produits commandés
      const quantityKeywords = {
        arabic: ['كمية', 'إجمالي', 'كمية المطلوبة', 'كمية الطلب', 'كمية المنتجات', 'كمية المنتجات المطلوبة'],
        french: ['quantité ', 'quantité commandée', 'total', 'total commandé', 'combien de', 'combien de produits'],
        english: ['quantity', 'total', 'how many', 'how many products', 'ordered quantity']
      };

      const isQuantityRequest = quantityKeywords[mainLanguage]?.some(keyword =>
        lowerPrompt.includes(keyword)
      ) || false;

      if (userNumber && isQuantityRequest) {
        const confirmations = await Confirmer.aggregate([
          {
            $lookup: {
              from: 'clients',
              localField: 'clientId',
              foreignField: '_id',
              as: 'client'
            }
          },
          { $unwind: '$client' },
          { $match: { 'client.customerPhone': userNumber } },
          {
            $lookup: {
              from: 'produits',
              localField: 'produitId',
              foreignField: '_id',
              as: 'produit'
            }
          },
          { $unwind: '$produit' },
          {
            $lookup: {
              from: 'productexels',
              localField: 'produit.sku',
              foreignField: '_id',
              as: 'productExel'
            }
          },
          { $sort: { createdAt: -1 } }
        ]);

        if (!confirmations.length || !confirmations.some(conf => conf.client)) {
          const noProductResponses = {
            arabic: [
              "لا أرى أي منتجات تم طلبها برقمك. هل ترغب في استكشاف منتجاتنا الجديدة؟",
              "لم يتم العثور على أي منتجات في سجل الشراء الخاص بك. هل تريد بعض التوصيات؟",
              "يبدو أن سجل الشراء الخاص بك فارغ. هل يمكنني مساعدتك في العثور على شيء ما؟"
            ],
            french: [
              "Je ne vois aucun produit commandé avec votre numéro. Souhaitez-vous découvrir nos nouveautés ?",
              "Aucun produit trouvé dans votre historique. Voulez-vous que je vous recommande quelques articles populaires ?",
              "Votre historique d'achat semble vide. Puis-je vous aider à trouver quelque chose ?"
            ],
            english: [
              "I don't see any products ordered with your number. Would you like to explore our new arrivals?",
              "No products found in your purchase history. Would you like some recommendations?",
              "Your purchase history seems empty. Can I help you find something?"
            ]
          };

          return noProductResponses[mainLanguage][Math.floor(Math.random() * noProductResponses[mainLanguage].length)];
        }

        // Construire la réponse
        const responseHeaders = {
          arabic: '🛍️ ملخص مشترياتك:\n\n',
          french: '🛍️ Voici un résumé de vos achats :\n\n',
          english: '🛍️ Here is a summary of your purchases:\n\n'
        };

        let response = responseHeaders[mainLanguage];

        confirmations.slice(0, 5).forEach((conf, index) => {
          if (conf.client && conf.produit) {
            const itemTexts = {
              arabic: [
                `✨ المنتج ${index + 1}: ${conf.produit.productName}\n`,
                `   📏 الكمية: ${conf.produit.quantity} وحدة\n`,
                `   💰 السعر: ${conf.produit.price} درهم\n`,
                `   🧮 الإجمالي: ${conf.produit.total} درهم\n`
              ],
              french: [
                `✨ Produit ${index + 1}: ${conf.produit.productName}\n`,
                `   📏 Quantité: ${conf.produit.quantity} unité(s)\n`,
                `   💰 Prix unitaire: ${conf.produit.price} MAD\n`,
                `   🧮 Total: ${conf.produit.total} MAD\n`
              ],
              english: [
                `✨ Product ${index + 1}: ${conf.produit.productName}\n`,
                `   📏 Quantity: ${conf.produit.quantity} unit(s)\n`,
                `   💰 Unit price: ${conf.produit.price} MAD\n`,
                `   🧮 Total: ${conf.produit.total} MAD\n`
              ]
            };

            response += itemTexts[mainLanguage].join('');

            if (conf.produit.quantity < 3) {
              response += {
                arabic: '   ⚠️ الكمية قليلة - هل ترغب في طلب المزيد؟\n',
                french: '   ⚠️ Quantité faible - Voulez-vous en commander plus ?\n',
                english: '   ⚠️ Low quantity - Would you like to order more?\n'
              }[mainLanguage];
            }

            response += '\n';
          }
        });

        if (confirmations.length > 5) {
          response += {
            arabic: `ℹ️ يوجد ${confirmations.length - 5} منتجات إضافية في سجل الشراء الخاص بك.\n\n`,
            french: `ℹ️ Plus ${confirmations.length - 5} produit(s) non affiché(s) dans votre historique.\n\n`,
            english: `ℹ️ ${confirmations.length - 5} more product(s) in your purchase history.\n\n`
          }[mainLanguage];
        }

        // Ajouter le total général
        const totalAmount = confirmations.reduce((sum, conf) => sum + (conf.produit.total || 0), 0);
        response += {
          arabic: `💵 المبلغ الإجمالي للمشتريات: ${totalAmount} درهم\n\n`,
          french: `💵 Montant total de vos achats: ${totalAmount} MAD\n\n`,
          english: `💵 Total purchase amount: ${totalAmount} MAD\n\n`
        }[mainLanguage];

        // Suggestions contextuelles
        const suggestions = {
          arabic: [
            "هل تحتاج مساعدة بخصوص أحد هذه المنتجات؟ فقط أخبرني أي واحد!",
            "هل ترغب في طلب أحد هذه العناصر مرة أخرى؟",
            "هل يمكنني مساعدتك بأي شيء آخر بخصوص هذه المنتجات؟"
          ],
          french: [
            "Besoin d'aide avec l'un de ces produits ? Dites-moi simplement lequel !",
            "Vous souhaitez commander à nouveau l'un de ces articles ?",
            "Puis-je vous aider avec autre chose concernant ces produits ?"
          ],
          english: [
            "Need help with one of these products? Just tell me which one!",
            "Would you like to reorder any of these items?",
            "Can I help you with anything else regarding these products?"
          ]
        };

        return response + suggestions[mainLanguage][Math.floor(Math.random() * suggestions[mainLanguage].length)];
      }

      // Recherche des informations sur l'utilisation
      const usageKeywords = {
        arabic: ['كيفية', 'استخدام', 'طريقة'],
        french: ['utiliser', 'comment utiliser', 'mode d\'emploi', 'comment utiliser produit', 'comment utiliser le produit'],
        english: ['use', 'how use', 'instructions']
      };

      const isUsageRequest = usageKeywords[mainLanguage]?.some(keyword =>
        lowerPrompt.includes(keyword)
      ) || false;

      if (isUsageRequest) {
        const usagePatterns = {
          arabic: /(?:كيفية| كيفيةاستخدام|طريقة)\s+(.+)/i,
          french: /(?:utiliser|comment utiliser|mode d\'emploi|comment utiliser produit|comment utiliser le produit)\s+(.+)/i,
          english: /(?:use|how use|instructions|how to use product|how to use the product)\s+(.+)/i
        };

        const productNameMatch = prompt.match(usagePatterns[mainLanguage] || usagePatterns.arabic);
        if (productNameMatch) {
          const productName = productNameMatch[1].trim();
          const product = await Produit.findOne({
            $or: [
              { name: { $regex: productName, $options: 'i' } },
              { keywords: { $in: [productName.toLowerCase()] } }
            ]
          }).lean();

          if (product && product.imageDescription) {
            const usageResponses = {
              arabic: [
                `إليك كيفية استخدام ${product.name}:\n${product.imageDescription}\n\nهل تحتاج إلى مزيد من التفاصيل؟`,
                `طريقة استخدام ${product.name}:\n${product.imageDescription}\n\nهل كل شيء واضح؟`,
                `إرشادات استخدام ${product.name}:\n${product.imageDescription}\n\nهل يمكنني مساعدتك أكثر؟`
              ],
              french: [
                `Voici comment utiliser ${product.name} :\n${product.imageDescription}\n\nBesoin de plus de détails ?`,
                `Instructions pour ${product.name} :\n${product.imageDescription}\n\nTout est clair ?`,
                `Mode d'emploi de ${product.name} :\n${product.imageDescription}\n\nPuis-je vous aider davantage ?`
              ],
              english: [
                `Here's how to use ${product.name}:\n${product.imageDescription}\n\nNeed more details?`,
                `Instructions for ${product.name}:\n${product.imageDescription}\n\nIs everything clear?`,
                `Usage guide for ${product.name}:\n${product.imageDescription}\n\nCan I help you further?`
              ]
            };

            return usageResponses[mainLanguage][Math.floor(Math.random() * usageResponses[mainLanguage].length)];
          } else {
            const notFoundResponses = {
              arabic: [
                `لم أتمكن من العثور على تعليمات لـ "${productName}". هل تريد أن أبحث بين منتجاتنا الأخرى؟`,
                `عذرًا، لا تتوفر معلومات عن "${productName}". هل يمكنك تجربة اسم منتج آخر؟`,
                `لا توجد تعليمات لـ "${productName}". ربما تعرف الاسم الكامل للمنتج؟`
              ],
              french: [
                `Je n'ai pas trouvé d'instructions pour "${productName}". Souhaitez-vous que je recherche parmi nos autres produits ?`,
                `Désolé, je n'ai pas d'information sur "${productName}". Voulez-vous essayer avec un autre nom de produit ?`,
                `Aucune instruction trouvée pour "${productName}". Peut-être connaissez-vous le nom exact du produit ?`
              ],
              english: [
                `I couldn't find instructions for "${productName}". Would you like me to search our other products?`,
                `Sorry, I don't have information about "${productName}". Would you try with another product name?`,
                `No instructions found for "${productName}". Maybe you know the full product name?`
              ]
            };

            return notFoundResponses[mainLanguage][Math.floor(Math.random() * notFoundResponses[mainLanguage].length)];
          }
        }
      }

      // Recherche basée sur la description
      const productPatterns = {
        arabic: /(?:منتج|شراء|شراء)\s+(.+)/i,
        french: /(?: description produit|article|acheter|détails de produit |information produit|info produit|info sur produit)\s+(.+)/i,
        english: /(?:product|item|buy)\s+(.+)/i
      };

      const productNameMatch = prompt.match(productPatterns[mainLanguage] || productPatterns.arabic);
      if (productNameMatch) {
        const productName = productNameMatch[1].trim();
        const product = await Produit.findOne({
          $or: [
            { name: { $regex: productName, $options: 'i' } },
            { keywords: { $in: [productName.toLowerCase()] } }
          ],
          isActive: true
        }).lean();

        if (product) {
          // En-têtes de réponse
          const responseHeaders = {
            arabic: `🌟 تفاصيل حول ${product.name}:\n\n`,
            french: `🌟 Détails sur ${product.name} :\n\n`,
            english: `🌟 Details about ${product.name}:\n\n`
          };

          let response = responseHeaders[mainLanguage];

          // Description
          response += {
            arabic: `📝 الوصف: ${product.description}\n`,
            french: `📝 Description: ${product.description}\n`,
            english: `📝 Description: ${product.description}\n`
          }[mainLanguage];

          // Conseils d'utilisation
          if (product.imageDescription) {
            response += {
              arabic: `📌 نصائح الاستخدام: ${product.imageDescription}\n`,
              french: `📌 Conseils d'utilisation: ${product.imageDescription}\n`,
              english: `📌 Usage tips: ${product.imageDescription}\n`
            }[mainLanguage];
          }

          // Prix
          response += {
            arabic: `💰 السعر: ${product.price} درهم\n`,
            french: `💰 Prix: ${product.price} MAD\n`,
            english: `💰 Price: ${product.price} MAD\n`
          }[mainLanguage];

          // Promotion
          if (product.discountPrice && product.discountPrice < product.price) {
            const discountPercent = Math.round((1 - product.discountPrice / product.price) * 100);
            response += {
              arabic: `🎁 سعر التخفيض: ${product.discountPrice} درهم (خصم ${discountPercent}%!)\n`,
              french: `🎁 Prix promo: ${product.discountPrice} MAD (${discountPercent}% de réduction!)\n`,
              english: `🎁 Discount price: ${product.discountPrice} MAD (${discountPercent}% off!)\n`
            }[mainLanguage];
          }

          // Catégorie
          response += {
            arabic: `📚 الفئة: ${product.category}\n`,
            french: `📚 Catégorie: ${product.category}\n`,
            english: `📚 Category: ${product.category}\n`
          }[mainLanguage];

          // Caractéristiques supplémentaires
          if (product.color) {
            response += {
              arabic: `🎨 الألوان المتاحة: ${product.color}\n`,
              french: `🎨 Couleurs disponibles: ${product.color}\n`,
              english: `🎨 Available colors: ${product.color}\n`
            }[mainLanguage];
          }

          if (product.size) {
            response += {
              arabic: `📏 المقاسات المتاحة: ${product.size}\n`,
              french: `📏 Tailles disponibles: ${product.size}\n`,
              english: `📏 Available sizes: ${product.size}\n`
            }[mainLanguage];
          }

          if (product.brand) {
            response += {
              arabic: `🏷️ الماركة: ${product.brand}\n`,
              french: `🏷️ Marque: ${product.brand}\n`,
              english: `🏷️ Brand: ${product.brand}\n`
            }[mainLanguage];
          }

          if (product.stock) {
            response += {
              arabic: `📦 المخزون: ${product.stock > 5 ? 'متوفر' : 'كمية محدودة!'}\n`,
              french: `📦 Stock: ${product.stock > 5 ? 'En stock' : 'Bientôt épuisé!'}\n`,
              english: `📦 Stock: ${product.stock > 5 ? 'In stock' : 'Limited quantity!'}\n`
            }[mainLanguage];
          }

          // Appel à l'action
          const ctas = {
            arabic: [
              "\n\nهل يهمك هذا المنتج؟ يمكنني مساعدتك في طلبه!",
              "\n\nهل ترغب في إضافة هذا المنتج إلى سلة التسوق؟",
              "\n\nهل تريد أن أرسل لك المزيد من الصور أو المعلومات؟"
            ],
            french: [
              "\n\nCe produit vous intéresse ? Je peux vous aider à le commander !",
              "\n\nSouhaitez-vous ajouter ce produit à votre panier ?",
              "\n\nVoulez-vous que je vous envoie plus de photos ou d'informations ?"
            ],
            english: [
              "\n\nInterested in this product? I can help you order it!",
              "\n\nWould you like to add this product to your cart?",
              "\n\nDo you want me to send you more photos or information?"
            ]
          };

          return response + ctas[mainLanguage][Math.floor(Math.random() * ctas[mainLanguage].length)];
        } else {
          const notFoundResponses = {
            arabic: [
              `لم أتمكن من العثور على منتج مطابق لـ "${productName}". هل تريد أن أبحث عن شيء مشابه؟`,
              `عذرًا، المنتج "${productName}" غير موجود في الكتالوج الخاص بنا. هل يمكنك تجربة اسم آخر؟`,
              `لا توجد نتائج لـ "${productName}". ربما تعرف الفئة أو الماركة؟`
            ],
            french: [
              `Je n'ai pas trouvé de produit correspondant à "${productName}". Souhaitez-vous que je recherche quelque chose de similaire ?`,
              `Désolé, le produit "${productName}" ne figure pas dans notre catalogue. Voulez-vous essayer avec un autre nom ?`,
              `Aucun résultat pour "${productName}". Peut-être connaissez-vous la marque ou la catégorie ?`
            ],
            english: [
              `I couldn't find a product matching "${productName}". Would you like me to search for something similar?`,
              `Sorry, the product "${productName}" is not in our catalog. Would you try another name?`,
              `No results for "${productName}". Maybe you know the brand or category?`
            ]
          };

          return notFoundResponses[mainLanguage][Math.floor(Math.random() * notFoundResponses[mainLanguage].length)];
        }
      }

      return null;
    } catch (error) {
      console.error('Error in checkProductInfo:', error);
      return null;
    }
  }

  /**
   * Vérifie si la demande concerne une recommandation de produit (version multilingue)
   */
  static async checkProductRecommendation(prompt, mainLanguage = 'arabic') {
    try {
      const lowerPrompt = prompt.toLowerCase();

      // Mots-clés multilingues pour les recommandations
      const recommendationKeywords = {
        arabic: ['يوصي', 'اقترح', 'ينصح', 'أفضل', 'جديد', 'عروض'],
        french: ['recommander', 'suggérer', 'proposer', 'recommandation', 'meilleur', 'nouveau', 'promo'],
        english: ['recommend', 'suggest', 'propose', 'recommendation', 'best', 'new', 'sale']
      };

      const isRecommendation = recommendationKeywords[mainLanguage]?.some(keyword =>
        lowerPrompt.includes(keyword)
      ) || false;

      if (!isRecommendation) return null;

      // Détection de la catégorie
      const categoryPatterns = {
        arabic: /(?:فئة|تصنيف|نوع|قسم)\s+(.+)/i,
        french: /(?:categorie|type|section)\s+(.+)/i,
        english: /(?:category|type|section)\s+(.+)/i
      };

      const categoryMatch = prompt.match(categoryPatterns[mainLanguage] || categoryPatterns.arabic);
      let category = categoryMatch ? categoryMatch[1].trim() : null;

      // Détection du budget
      const budgetPatterns = {
        arabic: /(?:ميزانية|حتى|بحد أقصى|سعر)\s*(\d+)/i,
        french: /(?:budget|jusqu'à|maximum|prix)\s*(\d+)/i,
        english: /(?:budget|up to|maximum|price)\s*(\d+)/i
      };

      const budgetMatch = prompt.match(budgetPatterns[mainLanguage] || budgetPatterns.arabic);
      const maxPrice = budgetMatch ? parseInt(budgetMatch[1]) : null;

      // Détection des caractéristiques
      const features = [];
      if (lowerPrompt.includes('nouveau') || lowerPrompt.includes('جديد') || lowerPrompt.includes('new')) features.push('new');
      if (lowerPrompt.includes('promo') || lowerPrompt.includes('خصم') || lowerPrompt.includes('sale')) features.push('discount');
      if (lowerPrompt.includes('populaire') || lowerPrompt.includes('شائع') || lowerPrompt.includes('popular')) features.push('popular');
      if (lowerPrompt.includes('meilleur') || lowerPrompt.includes('أفضل') || lowerPrompt.includes('best')) features.push('best');

      // Construction du filtre
      const filter = { isActive: true };
      if (category) filter.category = { $regex: category, $options: 'i' };
      if (maxPrice) filter.price = { $lte: maxPrice };
      if (features.includes('new')) filter.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
      if (features.includes('discount')) filter.discountPrice = { $exists: true };
      if (features.includes('popular')) filter.isFeatured = true;
      if (features.includes('best')) filter.rating = { $gte: 4 };

      // Tri des résultats
      let sort = {};
      if (features.includes('new')) sort.createdAt = -1;
      if (features.includes('best')) sort.rating = -1;
      if (features.includes('discount')) sort.discountPercentage = -1;
      if (Object.keys(sort).length === 0) sort.isFeatured = -1;

      const products = await Produit.find(filter)
        .sort(sort)
        .limit(5)
        .lean();

      if (!products.length) {
        const noProductResponses = {
          arabic: category ? [
            `لا يوجد لدينا أي منتجات في الفئة "${category}" ${maxPrice ? `بأقل من ${maxPrice} درهم` : ''}. هل تريد تجربة فئة أخرى؟`,
            `عذرًا، اختيارنا للفئة "${category}" فارغ مؤقتًا ${maxPrice ? `ضمن ميزانيتك` : ''}. هل يمكنني اقتراح شيء آخر؟`,
            `لا توجد نتائج لـ "${category}" ${maxPrice ? `بأقل من ${maxPrice} درهم` : ''}. هل تعرف فئات أخرى قد تهمك؟`
          ] : [
            `لم أتمكن من العثور على منتجات تطابق طلبك ${maxPrice ? `بأقل من ${maxPrice} درهم` : ''}. هل يمكنك توضيح ما تبحث عنه؟`,
            `لا يبدو أن كتالوجنا يتطابق مع بحثك ${maxPrice ? `ضمن هذا الميزانية` : ''}. هل تريد تجربة معايير أخرى؟`,
            `لم يتم العثور على منتجات ${maxPrice ? `ضمن هذا النطاق السعري` : ''}. هل يمكنني مساعدتك في تضييق نطاق البحث؟`
          ],
          french: category ? [
            `Nous n'avons actuellement aucun produit dans la catégorie "${category}" ${maxPrice ? `à moins de ${maxPrice} MAD` : ''}. Voulez-vous essayer une autre catégorie ?`,
            `Désolé, notre sélection "${category}" est temporairement vide ${maxPrice ? `dans votre budget` : ''}. Puis-je vous recommander autre chose ?`,
            `Aucun résultat pour "${category}" ${maxPrice ? `à moins de ${maxPrice} MAD` : ''}. Connaissez-vous d'autres catégories qui pourraient vous intéresser ?`
          ] : [
            `Je n'ai pas trouvé de produits correspondant à votre demande ${maxPrice ? `à moins de ${maxPrice} MAD` : ''}. Pouvez-vous préciser ce que vous cherchez ?`,
            `Notre catalogue semble ne pas correspondre à votre recherche ${maxPrice ? `dans ce budget` : ''}. Voulez-vous essayer avec d'autres critères ?`,
            `Aucun produit trouvé ${maxPrice ? `dans cette gamme de prix` : ''}. Puis-je vous aider à affiner votre recherche ?`
          ],
          english: category ? [
            `We currently don't have any products in the "${category}" category ${maxPrice ? `under ${maxPrice} MAD` : ''}. Would you like to try another category?`,
            `Sorry, our "${category}" selection is temporarily empty ${maxPrice ? `within your budget` : ''}. Can I recommend something else?`,
            `No results for "${category}" ${maxPrice ? `under ${maxPrice} MAD` : ''}. Do you know other categories that might interest you?`
          ] : [
            `I couldn't find products matching your request ${maxPrice ? `under ${maxPrice} MAD` : ''}. Can you specify what you're looking for?`,
            `Our catalog doesn't seem to match your search ${maxPrice ? `within this budget` : ''}. Would you try other criteria?`,
            `No products found ${maxPrice ? `in this price range` : ''}. Can I help you refine your search?`
          ]
        };

        return noProductResponses[mainLanguage][Math.floor(Math.random() * noProductResponses[mainLanguage].length)];
      }

      // Construire la réponse de recommandation
      const responseHeaders = {
        arabic: category ?
          `✨ إليك أفضل توصياتنا في فئة "${category}"` :
          `🌟 إليك بعض الاقتراحات التي قد تعجبك`,
        french: category ?
          `✨ Voici nos meilleures recommandations dans la catégorie "${category}"` :
          `🌟 Voici quelques suggestions qui pourraient vous plaire`,
        english: category ?
          `✨ Here are our top recommendations in the "${category}" category` :
          `🌟 Here are some suggestions you might like`
      };

      let response = responseHeaders[mainLanguage];

      if (maxPrice) {
        response += {
          arabic: ` (حتى ${maxPrice} درهم)`,
          french: ` (jusqu'à ${maxPrice} MAD)`,
          english: ` (up to ${maxPrice} MAD)`
        }[mainLanguage];
      }

      if (features.includes('new')) {
        response += {
          arabic: ' (جديد)',
          french: ' (Nouveautés)',
          english: ' (New arrivals)'
        }[mainLanguage];
      }

      if (features.includes('discount')) {
        response += {
          arabic: ' (خصومات)',
          french: ' (Promotions)',
          english: ' (On sale)'
        }[mainLanguage];
      }

      if (features.includes('best')) {
        response += {
          arabic: ' (الأفضل مبيعًا)',
          french: ' (Meilleures ventes)',
          english: ' (Best sellers)'
        }[mainLanguage];
      }

      response += `:\n\n`;

      // Ajouter les produits recommandés
      products.forEach((product, index) => {
        response += `${index + 1}. ${product.name}\n`;
        response += {
          arabic: `   💰 السعر: ${product.price} درهم`,
          french: `   💰 Prix: ${product.price} MAD`,
          english: `   💰 Price: ${product.price} MAD`
        }[mainLanguage];

        if (product.discountPrice) {
          response += {
            arabic: ` (🔴 خصم: ${product.discountPrice} درهم)`,
            french: ` (🔴 Promo: ${product.discountPrice} MAD)`,
            english: ` (🔴 Sale: ${product.discountPrice} MAD)`
          }[mainLanguage];
        }

        response += `\n`;

        response += {
          arabic: `   ⭐ التقييم: ${(product.rating || 0).toFixed(1)}/5\n`,
          french: `   ⭐ Note: ${(product.rating || 0).toFixed(1)}/5\n`,
          english: `   ⭐ Rating: ${(product.rating || 0).toFixed(1)}/5\n`
        }[mainLanguage];

        if (product.shortDescription) {
          response += {
            arabic: `   📌 ${product.shortDescription}\n`,
            french: `   📌 ${product.shortDescription}\n`,
            english: `   📌 ${product.shortDescription}\n`
          }[mainLanguage];
        }

        response += {
          arabic: `   🏷️ المرجع: ${product.sku}\n\n`,
          french: `   🏷️ Réf: ${product.sku}\n\n`,
          english: `   🏷️ Ref: ${product.sku}\n\n`
        }[mainLanguage];
      });

      // Appel à l'action contextuel
      const ctas = {
        arabic: [
          "\nأي من هذه المنتجات تهمك؟ يمكنني تقديم المزيد من التفاصيل!",
          "\nهل تريد أن أرسل لك المزيد من المعلومات عن أحد هذه العناصر؟",
          "\nهل ترغب في تصفية هذه النتائج حسب السعر أو الماركة أو أي معيار آخر؟",
          "\nيمكنني مساعدتك في طلب أحد هذه المنتجات. أي واحد تفضل؟"
        ],
        french: [
          "\nLequel de ces produits vous intéresse ? Je peux vous donner plus de détails !",
          "\nVoulez-vous que je vous envoie plus d'informations sur l'un de ces articles ?",
          "\nSouhaitez-vous filtrer ces résultats par prix, marque ou autre critère ?",
          "\nJe peux vous aider à commander l'un de ces produits. Lequel préférez-vous ?"
        ],
        english: [
          "\nWhich of these products interests you? I can provide more details!",
          "\nWould you like me to send you more information about any of these items?",
          "\nDo you want to filter these results by price, brand or other criteria?",
          "\nI can help you order one of these products. Which one do you prefer?"
        ]
      };

      return response + ctas[mainLanguage][Math.floor(Math.random() * ctas[mainLanguage].length)];
    } catch (error) {
      console.error('Error in checkProductRecommendation:', error);
      return null;
    }
  }

  /**
   * Génère une réponse via l'API OpenRouter dans la langue appropriée
   */
static async generateAIResponse(userMessage, detectedLanguage = 'unknown') {
  try {
    const prompt = `
أنت مساعد ذكي رجولي من المغرب، تتحدث وتفهم جميع اللهجات العربية، بما في ذلك الدارجة المغربية، اللهجة المصرية، الشامية، والخليجية، حتى لو كانت الكتابة غير رسمية أو تحتوي على أخطاء إملائية.

أنت مختص في متجر لبيع الأحذية.

تجيب فقط على الأسئلة المتعلقة بـ:
- أنواع الأحذية المتوفرة
- المقاسات، الأسعار، الألوان
- العروض، التوفر، المخزون
- طرق التوصيل، سياسة الإرجاع، ووسائل الدفع

⚠️ إذا كان السؤال خارج هذه المواضيع، أجب بلطف:
"أنا مختص فقط في بيع الأحذية. من فضلك أعد صياغة سؤالك."

💡 رسالة المستخدم (اللغة المكتشفة: ${detectedLanguage}):
"${userMessage}"

أجب باللهجة التي فهمتها، وكن واضحًا، مختصرًا، واحترافيًا.
`.trim();

    const run = async () => {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openrouter/auto',
          messages: [
            {
              role: 'system',
              content: 'أنت مساعد ذكي رجولي يتقن جميع اللهجات العربية ومتخصص في بيع الأحذية.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 300,
          presence_penalty: 0.5,
          frequency_penalty: 0.4
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'X-Title': 'Velya Shoes Assistant'
          },
          timeout: 15000
        }
      );
      return response?.data?.choices?.[0]?.message?.content;
    };

    const content = await pRetry(run, {
      retries: 3,
      minTimeout: 1000,
      onFailedAttempt: error => {
        console.warn(`Tentative ${error.attemptNumber} échouée. ${error.retriesLeft} restantes.`);
      }
    });

    if (!content) throw new Error('Réponse vide de l’API.');

    return this.postProcessResponse(content, detectedLanguage);
  } catch (error) {
    console.error('Erreur OpenRouter API:', {
      userMessage,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    return this.getFallbackResponse(userMessage);
  }
}


  /**
   * Nettoie et adapte la réponse générée par l'IA
   */
  static postProcessResponse(response, lang = 'arabic') {
    let cleaned = response
      .replace(/<[^>]*>?/gm, '')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    if (lang === 'arabic') {
      cleaned = cleaned.replace(/^\s*\d+\./gm, match => ` ${match.trim()} ✨`);
    } else {
      cleaned = cleaned.replace(/^\s*\d+\./gm, match => ` ${match.trim()} •`);
    }

    if (cleaned.length > 400) {
      const lastPunctuation = cleaned.substring(0, 400).search(/[.!؟。]\s/);
      if (lastPunctuation > 0) {
        cleaned = cleaned.substring(0, lastPunctuation + 1);
      } else {
        cleaned = cleaned.substring(0, 397) + '...';
      }
    }

    const endPunctuation = {
      arabic: /[.!؟»]$/,
      french: /[.!?»]$/,
      english: /[.!?]$/
    }[lang] || /[.!?]$/;

    if (!endPunctuation.test(cleaned)) {
      cleaned += lang === 'arabic' ? '...' : '...';
    }

    const endings = {
      arabic: [
        '\n\nهل تحتاج إلى مزيد من المعلومات؟',
        '\n\nهل يمكنني مساعدتك بأي شيء آخر؟',
        '\n\nهل هذا يجيب على سؤالك؟'
      ],
      french: [
        '\n\nBesoin de plus d\'informations ?',
        '\n\nPuis-je vous aider davantage ?',
        '\n\nEst-ce que cela répond à votre question ?'
      ],
      english: [
        '\n\nNeed more information?',
        '\n\nCan I help you with anything else?',
        '\n\nDoes this answer your question?'
      ]
    };

    if (Math.random() > 0.5 && cleaned.length < 350) {
      cleaned += endings[lang]?.[Math.floor(Math.random() * endings[lang].length)] || '';
    }

    return cleaned;
  }

  /**
   * Réponse alternative si l'IA échoue
   */
  static getFallbackResponse(message) {
    const arabicWords = ['مرحبا', 'كيف', 'أين', 'متى'];
    const frenchWords = ['bonjour', 'comment', 'où', 'quand'];
    const englishWords = ['hello', 'how', 'where', 'when'];

    const lowerPrompt = message.toLowerCase();
    let lang = 'arabic';

    if (frenchWords.some(w => lowerPrompt.includes(w))) lang = 'french';
    else if (englishWords.some(w => lowerPrompt.includes(w))) lang = 'english';

    const fallbacks = {
      arabic: [
        "عذرًا، لم أفهم سؤالك. هل يمكنك إعادة صياغته؟",
        "أواجه صعوبة في فهم الطلب. هل يمكنك توضيحه؟"
      ],
      french: [
        "Désolé, je n'ai pas compris. Pouvez-vous reformuler ?",
        "Je n’ai pas saisi votre demande. Pouvez-vous préciser ?"
      ],
      english: [
        "Sorry, I didn't understand. Can you rephrase?",
        "Could you express your question differently?"
      ]
    };

    return fallbacks[lang][Math.floor(Math.random() * fallbacks[lang].length)];
  }
}

export default OpenRouterService;