import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Tailwind,
  Text,
} from '@react-email/components'
import React from 'react'

interface CleaningReviewMissingProductsEmailProps {
  ownerName: string
  employeeName: string
  housingName?: string
  reviewLink: string
  missingProducts: string[]
}

export function CleaningReviewMissingProductsEmailTemplate({
  ownerName,
  employeeName,
  housingName,
  reviewLink,
  missingProducts,
}: CleaningReviewMissingProductsEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{employeeName} reported missing products for your cleaning review.</Preview>
      <Tailwind>
        <Body className="bg-white font-sans m-0 py-12">
          <Container className="max-w-[540px] mx-auto px-6">
            <Text className="text-base font-semibold m-0 mb-8" style={{ color: '#ea580c' }}>
              Clean Pilot
            </Text>

            <Heading className="text-2xl font-semibold text-gray-900 m-0 mb-4 leading-snug">
              Hi {ownerName}, missing products were reported.
            </Heading>

            <Text className="text-gray-500 text-sm leading-relaxed m-0 mb-4">
              <strong>{employeeName}</strong> has flagged missing products
              {housingName ? ` at ${housingName}` : ''} that need your attention.
            </Text>

            <div
              style={{
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
              }}
            >
              <Text className="text-gray-700 text-sm m-0 font-medium mb-2">Missing products:</Text>
              {missingProducts.map((product, i) => (
                <Text key={i} className="text-gray-600 text-sm m-0 mb-1">
                  · {product}
                </Text>
              ))}
            </div>

            <Text className="text-gray-500 text-sm leading-relaxed m-0 mb-6">
              Please review and take action. You can view the full cleaning report below.
            </Text>

            <Link
              href={reviewLink}
              style={{
                backgroundColor: '#ea580c',
                color: '#ffffff',
                padding: '10px 24px',
                borderRadius: '6px',
                fontWeight: '500',
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              View cleaning review
            </Link>

            <Hr className="border-gray-100 my-10" />

            <Text className="text-xs text-gray-400 m-0">
              You received this email because missing products were reported during a cleaning
              review.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
