interface NotificationEmailContent {
  subject: string;
  text: string;
  bodyHtml: string;
}

interface ListingNotificationData {
  recipientName: string;
  listingTitle: string;
  reason?: string;
}

interface MessageNotificationData {
  recipientName: string;
  senderName: string;
  listingTitle?: string;
  messagePreview: string;
}

interface SavedSearchMatchData {
  recipientName: string;
  listingTitle: string;
  listingId?: string;
}

interface AuctionEndedData {
  recipientName: string;
  listingTitle: string;
  outcome: 'SOLD' | 'RESERVE_NOT_MET' | 'NO_BIDS';
  finalBid: number | null;
  isSeller: boolean;
}

export function auctionEndedTemplate(
  data: AuctionEndedData,
): NotificationEmailContent {
  const sold = data.outcome === 'SOLD';
  const noBids = data.outcome === 'NO_BIDS';
  let result: string;
  if (sold) {
    result = data.isSeller
      ? `Your listing sold for ${data.finalBid ?? 0}.`
      : 'You won the auction.';
  } else if (noBids) {
    result = 'The auction ended without any bids.';
  } else if (data.isSeller) {
    result = 'The auction ended because the reserve price was not met.';
  } else {
    result =
      'The reserve price was not met, so the auction did not result in a sale.';
  }

  return {
    subject: sold
      ? `Auction ended: ${data.listingTitle} was sold`
      : `Auction ended: ${data.listingTitle}`,
    text: `Hi ${data.recipientName}, ${result}`,
    bodyHtml: `
      <tr>
        <td style="padding:8px 30px 0 30px; font-family:'Montserrat',Helvetica, Arial, sans-serif; font-size:16px; line-height:1.6; color:#3a3a3a;">
          <p style="margin:0 0 20px 0;">Hi ${data.recipientName},</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 30px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background-color:${sold ? '#D0F0DC' : '#FDE8E8'}; border-radius:6px; padding:16px; font-family:'Montserrat',Helvetica, Arial, sans-serif; font-size:15px; color:#3a3a3a;">
                <strong>${data.listingTitle}</strong><br />${result}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `,
  };
}

export function approveListingTemplate(
  data: ListingNotificationData,
): NotificationEmailContent {
  return {
    subject: 'Your listing has been approved',
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
        `,
  };
}

export function rejectedListingTemplate(
  data: ListingNotificationData & { reason?: string },
): NotificationEmailContent {
  return {
    subject: 'Your listing was not approved',
    text: `Hi ${data.recipientName}, your listing "${data.listingTitle}" was not approved.${data.reason ? `Reason: ${data.reason}` : ''}`,
    bodyHtml: `

            <tr>
                <td style="padding:8px 30px 0 30px; font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:16px; line-height:1.6; color:#3a3a3a;">
                    <p style="margin:0 0 20px 0;">Hi ${data.recipientName}, your listing needs a change before it can go live.</p>
                </td>
            </tr>

            <tr>
                <td style="padding:0 30px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="background-color:#FDE8E8; border-radius:6px; padding:16px;">
                                <span style="font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:14px; font-weight:700; color:#7F1D1D; display:block; margin-bottom:${data.reason ? '6px' : '0'};">
                                "${data.listingTitle}" was not approved, reason:
                                </span>
                                ${
                                  data.reason
                                    ? `<span style="font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:13px; color:#7F1D1D;">${data.reason}</span>`
                                    : ''
                                }
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <tr>
                <td style="padding:20px 30px 0 30px; font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:14px; line-height:1.6; color:#3a3a3a; text-align:center;">
                    <p style="margin:0;">You can edit and it will be re-evaluated</p>
                </td>
            </tr>
            `,
  };
}

export function newMessageTemplate(
  data: MessageNotificationData,
): NotificationEmailContent {
  return {
    subject: `New message from ${data.senderName}`,
    text: `Hi ${data.recipientName}, ${data.senderName} sent you a message about ${data.listingTitle}`,
    bodyHtml: `

      <tr>
        <td style="padding:8px 30px 0 30px; font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:16px; line-height:1.6; color:#3a3a3a;">
          <p style="margin:0 0 20px 0;">Hi ${data.recipientName}, you've got a new message${
            data.listingTitle
              ? ` about <strong>${data.listingTitle}</strong>`
              : ''
          }.</p>
        </td>
      </tr>

      <tr>

        <td style="padding:0 30px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background-color:#F5F5F5; border-left:4px solid #00B4D8; border-radius:4px; padding:16px;">
                <span style="font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:13px; font-weight:700; color:#000f2b; display:block; margin-bottom:6px;">
                  Message from ${data.senderName}
                </span>
              </td>
            </tr>
          </table>
        </td>

      </tr>
    `,
  };
}

export function listingEditedTemplate(
  data: ListingNotificationData & { changesSummary: string },
): NotificationEmailContent {
  return {
    subject: 'A listing you follow was updated',
    text: `Hi ${data.recipientName}, "${data.listingTitle}" was updated: ${data.changesSummary}`,
    bodyHtml: `

      <tr>
        <td style="padding:8px 30px 0 30px; font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:16px; line-height:1.6; color:#3a3a3a;">
          <p style="margin:0 0 20px 0;">Hi ${data.recipientName}, "${data.listingTitle}" was just updated.</p>
        </td>
      </tr>

      <tr>
        <td style="padding:0 30px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background-color:#D0F0F7; border-radius:6px; padding:16px;">
                <span style="font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:13px; color:#004F66;">
                  ${data.changesSummary}
                </span>
              </td>
            </tr>
          </table>
        </td>
        
      </tr>
    `,
  };
}

export function savedSearchMatchTemplate(
  data: SavedSearchMatchData,
): NotificationEmailContent {
  return {
    subject: 'A new listing matches your saved search',
    text: `Hi ${data.recipientName}, a new listing "${data.listingTitle}" matches one of your saved searches on Uni Textbook Marketplace.`,
    bodyHtml: `

            <tr>
                <td style="padding:8px 30px 0 30px; font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:16px; line-height:1.6; color:#3a3a3a;">
                    <p style="margin:0 0 20px 0;">Hi ${data.recipientName}, good news a new listing matches your saved search!</p>
                </td>
            </tr>

            <tr>
                <td style="padding:0 30px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td align="center" style="background-color:#D0F0F7; border-radius:6px; padding:16px;">
                                <span style="font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:16px; font-weight:700; color:#004F66;">
                                "${data.listingTitle}"
                                </span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <tr>
                <td style="padding:20px 30px 0 30px; font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:14px; line-height:1.6; color:#3a3a3a; text-align:center;">
                <p style="margin:0;">Check it out before it's gone.</p>
                </td>
            </tr>
        `,
  };
}
