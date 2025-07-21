import {
  getAllOffersService,
  getOfferByIdService,
  createOfferService,
  updateOfferService,
  deleteOfferService,
} from '../services/offer.service.js'

export const getAllOffers = async (req, res) => {
  try {
    const offers = await getAllOffersService()
    res.json(offers)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offers' })
  }
}

export const getOfferById = async (req, res) => {
  try {
    const offer = await getOfferByIdService(req.params.id)
    if (!offer) return res.status(404).json({ error: 'Offer not found' })
    res.json(offer)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offer' })
  }
}

export const createOffer = async (req, res) => {
  try {
    const file = req.files?.image?.[0]
    const offer = await createOfferService(req.body, file)
    res.status(201).json(offer)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create offer' })
  }
}

export const updateOffer = async (req, res) => {
  try {
    const file = req.files?.image?.[0]
    const offer = await updateOfferService(req.params.id, req.body, file)
    if (!offer) return res.status(404).json({ error: 'Offer not found' })
    res.json(offer)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update offer' })
  }
}

export const deleteOffer = async (req, res) => {
  try {
    const offer = await deleteOfferService(req.params.id)
    if (!offer) return res.status(404).json({ error: 'Offer not found' })
    res.json({ message: 'Offer deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete offer' })
  }
}
