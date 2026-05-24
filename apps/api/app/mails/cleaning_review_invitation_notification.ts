import { CleaningReviewInvitationEmailTemplate } from '#email_templates/cleaning_review_invitation_email_template'
import env from '#start/env'
import { BaseMail } from '@adonisjs/mail'
import { render } from '@react-email/render'

export default class CleaningReviewInvitationNotification extends BaseMail {
  from = env.get('SMTP_USERNAME')
  subject = 'Cleaning review — please upload your video'

  constructor(
    private employeeName: string,
    private employeeEmail: string,
    private reviewLink: string,
    private housingName?: string,
    private notes?: string | null
  ) {
    super()
  }

  async prepare() {
    this.message.to(this.employeeEmail)
    this.message.html(
      await render(
        CleaningReviewInvitationEmailTemplate({
          employeeName: this.employeeName,
          reviewLink: this.reviewLink,
          housingName: this.housingName,
          notes: this.notes,
        })
      )
    )
  }
}
