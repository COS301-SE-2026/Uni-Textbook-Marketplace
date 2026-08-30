export function wrapEmailPage(bodyHtml: string): string {

  return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link
                href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap"
                rel="stylesheet"
            />
        </head>

        <body style="margin:0; padding:0; background-color:#F5F5F5; font-family:'Montserrat', Helvetica, Arial, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F5F5;">
                <tr>
                    <td align="center" style="padding:32px 16px;">
                        <table role="presentation" width="500" cellpadding="0" cellspacing="0" border="0" style="max-width:500px; width:100%; background-color:#ffffff; border-radius:6px; overflow:hidden;">

                        <tr>
                            <td align="center" style="padding:32px 30px 8px 30px;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00B4D8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block; margin:0 auto 12px auto;">
                                <path d="M2 4.5C2 4.5 5 3 8 3s5 1.5 5 1.5v14S10.5 17 8 17s-6 1.5-6 1.5v-14z"></path>
                                <path d="M22 4.5C22 4.5 19 3 16 3s-5 1.5-5 1.5v14S13.5 17 16 17s6 1.5 6 1.5v-14z"></path>
                            </svg>
                            <h2 style="margin:0; font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:22px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#000f2b;">
                                <span style="color:#00B4D8;">Uni-Textbook</span> Marketplace
                            </h2>
                            </td>
                        </tr>

                        ${bodyHtml}

                        <tr>
                            <td style="padding:24px 30px 0 30px;">
                            <hr style="border:none; border-top:1px solid #dddddd; margin:0;" />
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:20px 30px 32px 30px; font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:13px; line-height:1.6; text-align:center; color:#4B4F58;">
                            <p style="margin:4px 0;">
                                Built by <strong style="color:#000f2b;">NexusDev</strong> with support from
                                <strong style="color:#00B4D8;">Agile Bridge</strong>
                            </p>
                            <p style="margin:8px 0 0 0; font-size:12px; color:#6b7280;">
                                University of Pretoria &bull; COS 301 Software Engineering
                            </p>
                            </td>
                        </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>
  `;
}