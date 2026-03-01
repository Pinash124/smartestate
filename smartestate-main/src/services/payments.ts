import { apiRequest } from './api'

type PayPayload = {
  userId: string
  listingId: string
  amount: number
}

export const paymentService = {
  pay: (data: PayPayload) =>
    apiRequest('/payments', {
      method: 'POST',
      body: data,
      auth: true
    })
}