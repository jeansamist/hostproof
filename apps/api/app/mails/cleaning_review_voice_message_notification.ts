import { CleaningReviewVoiceMessageEmailTemplate } from '#email_templates/cleaning_review_voice_message_email_template'
import env from '#start/env'
import { BaseMail } from '@adonisjs/mail'
import { render } from '@react-email/render'

export default class CleaningReviewVoiceMessageNotification extends BaseMail {
  from = env.get('SMTP_USERNAME')
  subject = 'Cleaning review — new voice message from employee'

  constructor(
    private ownerName: string,
    private ownerEmail: string,
    private employeeName: string,
    private reviewLink: string,
    private housingName?: string
  ) {
    super()
  }

  async prepare() {
    this.message.to(this.ownerEmail)
    this.message.html(
      await render(
        CleaningReviewVoiceMessageEmailTemplate({
          ownerName: this.ownerName,
          employeeName: this.employeeName,
          housingName: this.housingName,
          reviewLink: this.reviewLink,
        })
      )
    )
  }
}
