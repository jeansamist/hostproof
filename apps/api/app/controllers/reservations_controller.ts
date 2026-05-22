import { type ReservationService } from '#services/reservation_service'
import ReservationTransformer from '#transformers/reservation_transformer'
import { ApiResponse } from '#utils/api_response'
import { createReservationValidator, updateReservationValidator } from '#validators/reservation'
import { paginateValidator } from '#validators/pagination'
import type { HttpContext } from '@adonisjs/core/http'

export default class ReservationsController {
  constructor(private readonly reservationService: ReservationService) {}

  /**
   * Display a list of resource
   */
  async index({ request, serialize, response }: HttpContext) {
    const { page = 1, perPage = 15 } = await request.validateUsing(paginateValidator)
    const paginator = await this.reservationService.getPaginatedUserReservations(page, perPage)
    const serialized = await serialize(ReservationTransformer.transform(paginator.all()))
    return response.ok(
      ApiResponse.success(
        serialized.data,
        'Reservations retrieved successfully',
        paginator.getMeta()
      )
    )
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, serialize, response }: HttpContext) {
    const payload = await request.validateUsing(createReservationValidator)
    const reservation = await this.reservationService.createReservation(payload)
    const serialized = await serialize(ReservationTransformer.transform(reservation))
    return response.ok(ApiResponse.success(serialized.data, 'Reservation created successfully'))
  }

  /**
   * Show individual record
   */
  async show({ request, serialize, response }: HttpContext) {
    const reservation = await this.reservationService.getReservationById(request.param('id'))
    const serialized = await serialize(ReservationTransformer.transform(reservation))
    return response.ok(ApiResponse.success(serialized.data, 'Reservation retrieved successfully'))
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, serialize, response }: HttpContext) {
    const payload = await request.validateUsing(updateReservationValidator)
    const reservation = await this.reservationService.updateReservation(params.id, payload)
    const serialized = await serialize(ReservationTransformer.transform(reservation))
    return response.ok(ApiResponse.success(serialized.data, 'Reservation updated successfully'))
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    await this.reservationService.deleteReservation(params.id)
    return response.ok(ApiResponse.success(null, 'Reservation deleted successfully'))
  }
}
