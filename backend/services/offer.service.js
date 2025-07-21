import Offer from '../models/Offer.model.js'
import cloudinary from '../config/cloudinary.js'
import fs from 'fs'

export const getAllOffersService = async () => {
  return await Offer.find().sort({ createdAt: -1 })
}

export const getOfferByIdService = async (id) => {
  return await Offer.findById(id)
}

export const createOfferService = async (data, file) => {
  let imageUrl = null

  if (file) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'offers',
    })
    imageUrl = result.secure_url
    fs.unlinkSync(file.path)
  }

  const offer = new Offer({
    image: imageUrl,
    text: data.text,
    storeUrl: data.storeUrl,
  })

  return await offer.save()
}

export const updateOfferService = async (id, data, file) => {
  const offer = await Offer.findById(id)
  if (!offer) return null

  const updateData = {
    text: data.text || offer.text,
    storeUrl: data.storeUrl || offer.storeUrl,
  }

  if (file) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'offers',
    })
    updateData.image = result.secure_url
    fs.unlinkSync(file.path)
  } else {
    updateData.image = null // Si pas de nouvelle image, on garde l'ancienne                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
  }

  return await Offer.findByIdAndUpdate(id, updateData, { new: true })
}

export const deleteOfferService = async (id) => {
  const offer = await Offer.findById(id)
  if (!offer) return null
  // Si image Cloudinary : on ne la supprime pas ici sauf si tu stockes son public_id
  return await Offer.findByIdAndDelete(id)
}
