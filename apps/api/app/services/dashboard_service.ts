import CleaningReview from '#models/cleaning_review'
import Employee from '#models/employee'
import Housing from '#models/housing'
import Reservation from '#models/reservation'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

@inject()
export class DashboardService {
  constructor(private readonly ctx: HttpContext) {}

  private get userId() {
    return this.ctx.auth.user!.id
  }

  async getStats() {
    const userId = this.userId
    const now = DateTime.now()

    const [housingResult, employeeResult, upcomingResult, succeededResult] = await Promise.all([
      Housing.query().where('user_id', userId).count('* as total').first(),
      Employee.query().where('user_id', userId).count('* as total').first(),
      Reservation.query()
        .whereHas('housing', (q) => q.where('user_id', userId))
        .where('move_in_date', '>=', now.toSQL()!)
        .count('* as total')
        .first(),
      CleaningReview.query()
        .whereHas('reservation', (q) =>
          q.whereHas('housing', (h) => h.where('user_id', userId))
        )
        .where('status', 'Done')
        .count('* as total')
        .first(),
    ])

    return {
      totalHousings: Number(housingResult?.$extras.total ?? 0),
      totalEmployees: Number(employeeResult?.$extras.total ?? 0),
      upcomingReservations: Number(upcomingResult?.$extras.total ?? 0),
      succeededCleaningReviews: Number(succeededResult?.$extras.total ?? 0),
    }
  }
}
