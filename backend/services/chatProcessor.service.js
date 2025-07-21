import franc from 'franc-min';
import langs from 'langs';
import OpenRouterService from './OpenRouterService.js';

/**
 * ChatProcessor : gère la détection de langue, dialecte, et traitement message utilisateur
 */
class ChatProcessor {

  /**
   * Détecte la langue d'un texte avec franc-min et langs
   * Retourne 'arabic', 'french', 'english' ou 'unknown'
   */
  static detectLanguageAuto(text) {
    const langCode = franc(text);
    if (langCode === 'ara') return 'arabic';
    if (langCode === 'fra') return 'french';
    if (langCode === 'eng') return 'english';
    return 'unknown';
  }

  /**
   * Détecte si l'arabe est dialectal sa3odiya, maghribi, ou autre, basé sur des mots-clés simples
   * Retourne 'sa3odiya', 'maghribi', 'standard', ou null si pas arabe
   */
  static detectArabicDialect(text) {
    const sa3odiyaKeywords = ['وش', 'كيف حالك', 'تمام', 'يابو', 'حبيبي'];
    const maghribiKeywords = ['شحال', 'كيداير', 'بصحة', 'واش', 'الله يبارك'];

    const lowerText = text.toLowerCase();

    if (sa3odiyaKeywords.some(w => lowerText.includes(w))) return 'sa3odiya';
    if (maghribiKeywords.some(w => lowerText.includes(w))) return 'maghribi';
    // Par défaut, dialecte standard arabe
    return 'standard';
  }

  /**
   * Traite un message utilisateur, détecte la langue et appelle OpenRouter pour réponse
   */
  static async processUserMessage(message) {
    // 1. Détecter langue
    let mainLanguage = this.detectLanguageAuto(message);
    if (mainLanguage === 'arabic') {
      // détecter dialecte arabe
      const dialect = this.detectArabicDialect(message);
      // Ici on peut adapter mainLanguage si on veut gérer dialectes spécifiques
      // Pour l'instant on garde 'arabic' pour tout arabe
      mainLanguage = 'arabic';
    }

    // 2. Appeler OpenRouterService pour générer réponse AI
    const response = await OpenRouterService.generateAIResponse(message, mainLanguage);

    // 3. Retourner réponse
    return response || "Désolé, je n'ai pas pu générer de réponse.";
  }
}

export default ChatProcessor;
