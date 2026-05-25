import { CleaningReviewMissingProductsEmailTemplate } from '#email_templates/cleaning_review_missing_products_email_template'
import env from '#start/env'
import { BaseMail } from '@adonisjs/mail'
import { render } from '@react-email/render'

export default class CleaningReviewMissingProductsNotification extends BaseMail {
  from = env.get('SMTP_USERNAME')
  subject = 'Cleaning review — missing products reported'

  constructor(
    private ownerName: string,
    private ownerEmail: string,
    private employeeName: string,
    private reviewLink: string,
    private missingProducts: string[],
    private housingName?: string
  ) {
    super()
  }

  async prepare() {
    this.message.to(this.ownerEmail)
    this.message.html(
      await render(
        CleaningReviewMissingProductsEmailTemplate({
          ownerName: this.ownerName,
          employeeName: this.employeeName,
          housingName: this.housingName,
          reviewLink: this.reviewLink,
          missingProducts: this.missingProducts,
        })
      )
    )
  }
}
