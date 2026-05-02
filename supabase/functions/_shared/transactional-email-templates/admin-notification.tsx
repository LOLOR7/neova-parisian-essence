import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Neova'

interface AdminNotificationProps {
  eventTitle?: string
  summary?: string
  details?: Array<{ label: string; value: string }>
  ctaNote?: string
}

const AdminNotificationEmail = ({
  eventTitle = 'New activity on Neova',
  summary = '',
  details = [],
  ctaNote = '',
}: AdminNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{eventTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>{SITE_NAME} — Internal notification</Text>
        <Heading style={h1}>{eventTitle}</Heading>
        {summary ? <Text style={text}>{summary}</Text> : null}
        {details.length > 0 ? (
          <Section style={card}>
            {details.map((d, i) => (
              <Text key={i} style={row}>
                <span style={label}>{d.label}</span>
                <span style={value}>{d.value || '—'}</span>
              </Text>
            ))}
          </Section>
        ) : null}
        {ctaNote ? (
          <>
            <Hr style={hr} />
            <Text style={footer}>{ctaNote}</Text>
          </>
        ) : null}
        <Text style={footer}>This is an automated message from the Neova admin system.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminNotificationEmail,
  subject: (data: Record<string, any>) =>
    data?.eventTitle ? `[Neova] ${data.eventTitle}` : '[Neova] New activity',
  displayName: 'Admin notification',
  previewData: {
    eventTitle: 'New property demand received',
    summary: 'A new client just submitted a property search request.',
    details: [
      { label: 'Name', value: 'Jane Doe' },
      { label: 'Email', value: 'jane@example.com' },
      { label: 'Location', value: 'Paris 7e' },
      { label: 'Budget', value: '1 200 000 €' },
    ],
    ctaNote: 'Open the admin dashboard to qualify this demand.',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const eyebrow = {
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: '#9a8f7a',
  margin: '0 0 14px',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 600,
  color: '#111111',
  margin: '0 0 18px',
  lineHeight: '1.3',
}
const text = { fontSize: '14px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 20px' }
const card = {
  backgroundColor: '#faf7f2',
  border: '1px solid #ece6da',
  borderRadius: '10px',
  padding: '18px 20px',
  margin: '0 0 20px',
}
const row = { fontSize: '13px', margin: '0 0 8px', lineHeight: '1.5' }
const label = {
  display: 'inline-block',
  width: '120px',
  color: '#8a8170',
  textTransform: 'uppercase' as const,
  fontSize: '11px',
  letterSpacing: '0.08em',
}
const value = { color: '#111111', fontWeight: 500 }
const hr = { border: 'none', borderTop: '1px solid #ece6da', margin: '24px 0 16px' }
const footer = { fontSize: '12px', color: '#9a8f7a', margin: '8px 0 0', lineHeight: '1.5' }