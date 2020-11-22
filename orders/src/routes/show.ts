import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import {
  NotFoundError,
  NotAuthorizedError,
  BadRequestError,
  requireAuth
} from '@reedytickets/common'
import { Order } from '../models/order'

const router = express.Router()

router.get(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new BadRequestError('Not valid order ID')
    }

    const order = await Order
      // .findOne({
      //   _id: orderId,
      //   userId: req.currentUser!.id
      // })
      .findById(orderId)
      .populate('ticket')

    if (!order) {
      throw new NotFoundError()
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    res.send(order)
  }
)

export { router as showOrderRouter }
