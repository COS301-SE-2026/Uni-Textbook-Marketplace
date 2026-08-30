interface NotificationEmailContent {

    subject: string;
    text: string;
    bodyHtml: string;
}

interface ListingNotificationData {

    recipientName: string;
    listingTitle: string;

}


export function approveListingTemplate(data: ListingNotificationData): NotificationEmailContent {

    return {

        subject: 'Your listing has been approve',
        text: `Hi ${data.recipientName}, your listing "${data.listingTitle}" is now approved and live on Uni Textbook Marketplace.`,
        bodyHtml: `
            <tr>
                <td style="padding:8px 30px 0 30px; font-family:'Montserrat',Helvetica, Arial, sans-serif; font-size:16px; line-height:1.6; color:#3a3a3a;">
                    <p style="margin:0 0 20px 0;">Hi ${data.recipientName}, good news!</p>
                </td> 
            </tr>

            <tr>
                <td style="padding:0 30px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td align="center" style="background-color:#D0F0DC; border-radius:6px; padding:16px;">
                                <span style="font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:16px; font-weight:700; color:#155E2E;">
                                "${data.listingTitle}" is now approved and live
                                </span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <tr>
                <td style="padding:20px 30px 0 30px; font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:14px; line-height:1.6; color:#3a3a3a; text-align:center;">
                <p style="margin:0;">Students can now find and message you about it.</p>
                </td>
            </tr>
        `
    }

}