import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { name, email, role, message } = req.body ?? {};

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required.' });
  }

  try {
    await resend.emails.send({
      from: 'MyMedVisit Contact Form <onboarding@resend.dev>', // Replace with your verified domain (e.g., updates@mymedvisit.app) once set up
      to: 'admin@mymedvisit.app',
      replyTo: email,
      subject: `New Early Access Request from ${name}`,
      html: `
        <h2>New Early Access Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>User Email:</strong> ${email}</p>
        <p><strong>User Type / Role:</strong> ${role || 'Not specified'}</p>
        <p><strong>Message / Notes:</strong></p>
        <p>${message || 'No additional message provided.'}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to send email:', error);
    return res.status(500).json({ success: false, error: 'Failed to send request.' });
  }
}
