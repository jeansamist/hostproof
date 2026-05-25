import { CleaningReviewRequestNewReviewEmailTemplate } from '#email_templates/cleaning_review_request_new_review_email_template'
import env from '#start/env'
import { BaseMail } from '@adonisjs/mail'
import { render } from '@react-email/render'

export default class CleaningReviewRequestNewReviewNotification extends BaseMail {
  from = env.get('SMTP_USERNAME')
  subject = 'Cleaning review — new review requested'

  constructor(
    private ownerName: string,
    private ownerEmail: string,
    private employeeName: string,
    private reviewLink: string,
    private toDoItems: string[],
    private housingName?: string
  ) {
    super()
  }

  async prepare() {
    this.message.to(this.ownerEmail)
    this.message.html(
      await render(
        CleaningReviewRequestNewReviewEmailTemplate({
          ownerName: this.ownerName,
          employeeName: this.employeeName,
          housingName: this.housingName,
          reviewLink: this.reviewLink,
          toDoItems: this.toDoItems,
        })
      )
    )
  }
}
