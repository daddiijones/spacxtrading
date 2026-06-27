import nodemailer from 'nodemailer'

const smtpPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || "2525")

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER || "125fc52da35a45",
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || "982adb369f2d47"
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Helper for generating responsive, premium HTML wrapper
const getHtmlLayout = (title, contentHTML) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body {
        background-color: #000000;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #adadad;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #0d0d0d;
        border: 1px solid rgba(14, 165, 233, 0.25);
        border-radius: 12px;
        overflow: hidden;
        margin-top: 40px;
        margin-bottom: 40px;
        box-shadow: 0 10px 30px rgba(14, 165, 233, 0.05);
      }
      .header {
        background: linear-gradient(135deg, #0ea5e9 0%, #0b3d91 100%);
        padding: 30px 20px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        color: #ffffff;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: 0.5px;
      }
      .content {
        padding: 40px 30px;
        line-height: 1.6;
      }
      .content h2 {
        color: #ffffff;
        font-size: 20px;
        font-weight: 700;
        margin-top: 0;
        margin-bottom: 20px;
      }
      .content p {
        font-size: 15px;
        color: #adadad;
        margin-bottom: 24px;
      }
      .btn {
        display: inline-block;
        padding: 12px 28px;
        background-color: #0ea5e9;
        color: #ffffff !important;
        text-decoration: none;
        font-weight: 700;
        font-size: 15px;
        border-radius: 6px;
        margin-top: 10px;
        margin-bottom: 10px;
        text-align: center;
        transition: background 0.3s ease;
      }
      .highlight-box {
        background-color: rgba(14, 165, 233, 0.06);
        border: 1px dashed rgba(14, 165, 233, 0.3);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 24px;
      }
      .highlight-box table {
        width: 100%;
        border-collapse: collapse;
      }
      .highlight-box td {
        padding: 6px 0;
        font-size: 14px;
      }
      .highlight-box td.label {
        color: #666666;
        font-weight: 600;
        width: 40%;
      }
      .highlight-box td.value {
        color: #ffffff;
        font-weight: 700;
        text-align: right;
      }
      .otp-code {
        font-size: 32px;
        font-weight: 900;
        color: #0ea5e9;
        letter-spacing: 6px;
        text-align: center;
        margin: 20px 0;
        padding: 15px;
        background-color: rgba(14, 165, 233, 0.08);
        border-radius: 8px;
        border: 1px solid rgba(14, 165, 233, 0.2);
      }
      .footer {
        background-color: #050505;
        padding: 24px 30px;
        text-align: center;
        border-top: 1px solid rgba(255, 255, 255, 0.04);
      }
      .footer p {
        font-size: 12px;
        color: #555555;
        margin: 4px 0;
      }
      .footer a {
        color: #0ea5e9;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🚀 SPACEX TRADING</h1>
      </div>
      <div class="content">
        ${contentHTML}
      </div>
      <div class="footer">
        <p>© 2026 SpaceX Trading. All rights reserved.</p>
        <p>This message was sent from a secure automated mission control server.</p>
        <p><a href="http://spacxtrading.online">spacxtrading.online</a></p>
      </div>
    </div>
  </body>
  </html>
  `
}

export const emailService = {
  // 1. Send OTP for Login
  async sendLoginOTP(toEmail, otpCode) {
    const content = `
      <h2>Access Control Authentication</h2>
      <p>Secure login requested for your account. Please use the following One-Time Password (OTP) authorization code to complete your connection to SpaceX Trading mission control:</p>
      <div class="otp-code">${otpCode}</div>
      <p>This credential remains valid for exactly 10 minutes. If you did not initiate this authentication request, please change your credentials immediately.</p>
    `
    const html = getHtmlLayout("Authorize Access", content)
    await transporter.sendMail({
      from: `"SpaceX Trading Authentication" <${process.env.EMAIL_FROM || 'support@spacxtrading.online'}>`,
      to: toEmail,
      subject: `[OTP] Authorization Code: ${otpCode}`,
      html
    })
  },

  // 1b. Send OTP for Registration
  async sendRegisterOTP(toEmail, otpCode) {
    const content = `
      <h2>Launch Account Verification</h2>
      <p>Thank you for initiating registration on the SpaceX Trading investment platform. To verify your email address and activate your launch account, please enter the following 6-digit verification security code:</p>
      <div class="otp-code">${otpCode}</div>
      <p>This code remains active for exactly 15 minutes. If you did not request this registration, please safely ignore this email.</p>
    `
    const html = getHtmlLayout("Verify Your Account", content)
    await transporter.sendMail({
      from: `"SpaceX Trading Registration" <${process.env.EMAIL_FROM || 'support@spacxtrading.online'}>`,
      to: toEmail,
      subject: `[SpaceX Trading] Verify your email address (OTP: ${otpCode})`,
      html
    })
  },

  // 1c. Send OTP for Password Reset
  async sendPasswordResetOTP(toEmail, otpCode) {
    const content = `
      <h2>Account Security Password Reset</h2>
      <p>A request was made to reset your SpaceX Trading account password. To authorize this change and verify your identity, please use the following secure 6-digit Reset OTP authorization code:</p>
      <div class="otp-code">${otpCode}</div>
      <p>This code remains active for exactly 15 minutes. If you did not request a password reset, please change your password from your dashboard settings immediately or contact security support.</p>
    `
    const html = getHtmlLayout("Password Authorization Reset", content)
    await transporter.sendMail({
      from: `"SpaceX Trading Security" <${process.env.EMAIL_FROM || 'support@spacxtrading.online'}>`,
      to: toEmail,
      subject: `[OTP] Password Reset Authorization: ${otpCode}`,
      html
    })
  },

  // 2. Deposit Initiated
  async sendDepositInitiated(toEmail, depositDetails) {
    const content = `
      <h2>Deposit Request Received</h2>
      <p>Your deposit request has been registered and is awaiting blockchain transaction validation. Your balance will be ready for mission deployment immediately upon network confirmation.</p>
      <div class="highlight-box">
        <table>
          <tr>
            <td class="label">Reference ID</td>
            <td class="value">${depositDetails.id.substring(0, 8).toUpperCase()}</td>
          </tr>
          <tr>
            <td class="label">Payment Type</td>
            <td class="value">${depositDetails.cryptoType}</td>
          </tr>
          <tr>
            <td class="label">Total Amount</td>
            <td class="value">$${Number(depositDetails.amount).toFixed(2)}</td>
          </tr>
          <tr>
            <td class="label">Current Status</td>
            <td class="value" style="color: #f59e0b;">AWAITING CONFIRMATION</td>
          </tr>
        </table>
      </div>
      <p>Once you make the payment to the address shown on your screen, our automated systems will verify and credit your balance.</p>
    `
    const html = getHtmlLayout("Deposit Initiated", content)
    await transporter.sendMail({
      from: `"SpaceX Trading Billing" <${process.env.EMAIL_FROM || 'support@spacxtrading.online'}>`,
      to: toEmail,
      subject: `🔄 Deposit Request Received ($${Number(depositDetails.amount).toFixed(2)})`,
      html
    })
  },

  // 3. Deposit Approved
  async sendDepositApproved(toEmail, depositDetails) {
    const content = `
      <h2>Deposit Confirmed</h2>
      <p>Great news! Your cryptocurrency deposit has been successfully verified on the blockchain and approved by the system. The funds have been credited to your active wallet.</p>
      <div class="highlight-box">
        <table>
          <tr>
            <td class="label">Transaction ID</td>
            <td class="value">${depositDetails.id.substring(0, 8).toUpperCase()}</td>
          </tr>
          <tr>
            <td class="label">Asset Deposited</td>
            <td class="value">${depositDetails.cryptoType}</td>
          </tr>
          <tr>
            <td class="label">Funded Amount</td>
            <td class="value" style="color: #0ea5e9;">+$${Number(depositDetails.amount).toFixed(2)}</td>
          </tr>
          <tr>
            <td class="label">System Status</td>
            <td class="value" style="color: #0ea5e9;">COMPLETED / READY</td>
          </tr>
        </table>
      </div>
      <p>You can now head to the plans console to launch a Falcon, Dragon, or Starship investment contract using your newly funded balance.</p>
      <center><a href="http://spacxtrading.online/plans" class="btn">Launch a New Mission</a></center>
    `
    const html = getHtmlLayout("Deposit Approved", content)
    await transporter.sendMail({
      from: `"SpaceX Trading Systems" <${process.env.EMAIL_FROM || 'support@spacxtrading.online'}>`,
      to: toEmail,
      subject: `✅ Deposit Approved & Credited: +$${Number(depositDetails.amount).toFixed(2)}`,
      html
    })
  },

  // 3b. Admin Deposit Approved Notification
  async sendAdminDepositApproved(adminEmail, userEmail, depositDetails) {
    const content = `
      <h2>Deposit Approval Processed</h2>
      <p>This is an administrative record confirming that you have successfully validated and approved a customer's cryptocurrency deposit. The customer's balance is now ready for mission deployment.</p>
      <div class="highlight-box">
        <table>
          <tr>
            <td class="label">Approved By (Admin)</td>
            <td class="value">${adminEmail}</td>
          </tr>
          <tr>
            <td class="label">Customer Account</td>
            <td class="value">${userEmail}</td>
          </tr>
          <tr>
            <td class="label">Transaction ID</td>
            <td class="value">${depositDetails.id.substring(0, 8).toUpperCase()}</td>
          </tr>
          <tr>
            <td class="label">Asset Funded</td>
            <td class="value">${depositDetails.cryptoType}</td>
          </tr>
          <tr>
            <td class="label">Total Amount</td>
            <td class="value" style="color: #0ea5e9;">$${Number(depositDetails.amount).toFixed(2)}</td>
          </tr>
        </table>
      </div>
      <p>This confirmation is archived securely in database ledgers.</p>
    `
    const html = getHtmlLayout("Admin: Deposit Approved", content)
    await transporter.sendMail({
      from: `"SpaceX Trading Admin" <${process.env.EMAIL_FROM || 'support@spacxtrading.online'}>`,
      to: adminEmail,
      subject: `🛡 [ADMIN ALERT] Deposit Confirmed for ${userEmail}: $${Number(depositDetails.amount).toFixed(2)}`,
      html
    })
  },

  // 4. Withdrawal Request Initiated
  async sendWithdrawalInitiated(toEmail, withdrawDetails) {
    const content = `
      <h2>Withdrawal Request Received</h2>
      <p>A request to withdraw accrued investment yield from your spot balance has been successfully initiated. Funds will be dispatched shortly pending admin approval.</p>
      <div class="highlight-box">
        <table>
          <tr>
            <td class="label">Request Reference</td>
            <td class="value">${withdrawDetails.id.substring(0, 8).toUpperCase()}</td>
          </tr>
          <tr>
            <td class="label">Dispatched Asset</td>
            <td class="value">${withdrawDetails.cryptoType}</td>
          </tr>
          <tr>
            <td class="label">Total Amount</td>
            <td class="value" style="color: #ef4444;">-$${Number(withdrawDetails.amount).toFixed(2)}</td>
          </tr>
          <tr>
            <td class="label">Recipient Destination</td>
            <td class="value" style="font-size: 11px;">${withdrawDetails.walletAddress}</td>
          </tr>
        </table>
      </div>
      <p>Withdrawals are processed security-first. Our security team will confirm the transfer within 24 hours.</p>
    `
    const html = getHtmlLayout("Withdrawal Initiated", content)
    await transporter.sendMail({
      from: `"SpaceX Trading Vault" <${process.env.EMAIL_FROM || 'support@spacxtrading.online'}>`,
      to: toEmail,
      subject: `📤 Withdrawal Dispatched ($${Number(withdrawDetails.amount).toFixed(2)})`,
      html
    })
  },

  // 5. Mining Lease Initiated
  async sendMiningInitiated(toEmail, miningDetails) {
    const content = `
      <h2>Mission Contract Activated</h2>
      <p>Your investment contract has successfully launched! Your capital is now deployed into the SpaceX Trading fleet and accruing yield.</p>
      <div class="highlight-box">
        <table>
          <tr>
            <td class="label">Mission Plan</td>
            <td class="value">${miningDetails.plan?.name || 'Leased Plan'}</td>
          </tr>
          <tr>
            <td class="label">Vehicle Class</td>
            <td class="value">${miningDetails.plan?.hashRate || 'Launch Class'}</td>
          </tr>
          <tr>
            <td class="label">Capital Deployed</td>
            <td class="value">$${Number(miningDetails.investedAmount).toFixed(2)}</td>
          </tr>
          <tr>
            <td class="label">Estimated Yield</td>
            <td class="value" style="color: #0ea5e9;">${miningDetails.plan?.dailyROI}% Daily ROI</td>
          </tr>
          <tr>
            <td class="label">Mission Duration</td>
            <td class="value">${miningDetails.durationDays} Days</td>
          </tr>
        </table>
      </div>
      <p>Watch your accrued spot wallet balance increase in real time from the control panel.</p>
      <center><a href="http://spacxtrading.online/dashboard" class="btn">View My Missions</a></center>
    `
    const html = getHtmlLayout("Mission Launch Confirmed", content)
    await transporter.sendMail({
      from: `"SpaceX Trading" <${process.env.EMAIL_FROM || 'support@spacxtrading.online'}>`,
      to: toEmail,
      subject: `🚀 Investment Contract Launched: ${miningDetails.plan?.name}`,
      html
    })
  },

  // 6. Mining Lease Ended (Offline/Accrual finished notification)
  async sendMiningEnded(toEmail, miningDetails) {
    const content = `
      <h2>Mission Contract Completed</h2>
      <p>Your investment contract has successfully completed its mission cycle and reached splashdown. All earnings have been fully paid out and locked in your wallet.</p>
      <div class="highlight-box">
        <table>
          <tr>
            <td class="label">Mission Plan</td>
            <td class="value">${miningDetails.plan?.name || 'Leased Plan'}</td>
          </tr>
          <tr>
            <td class="label">Original Investment</td>
            <td class="value">$${Number(miningDetails.investedAmount).toFixed(2)}</td>
          </tr>
          <tr>
            <td class="label">Total Return Yield</td>
            <td class="value" style="color: #0ea5e9; font-weight: 800;">+$${Number(miningDetails.totalEarned).toFixed(2)}</td>
          </tr>
          <tr>
            <td class="label">Mission Completion</td>
            <td class="value">100.00% (Completed)</td>
          </tr>
        </table>
      </div>
      <p>To continue generating premium yield from our Falcon and Starship fleet, launch another mission contract today.</p>
      <center><a href="http://spacxtrading.online/plans" class="btn">Launch Another Mission</a></center>
    `
    const html = getHtmlLayout("Mission Completed Successfully", content)
    await transporter.sendMail({
      from: `"SpaceX Trading" <${process.env.EMAIL_FROM || 'support@spacxtrading.online'}>`,
      to: toEmail,
      subject: `🏁 Mission Completed & Yield Paid Out: ${miningDetails.plan?.name}`,
      html
    })
  },

  // 7. Live Chat — admin offline alert
  async sendLiveChatAlert({ guestName, guestEmail, guestIp, sessionId }) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@spacxtrading.online'
    const content = `
      <h2>Live Chat Request — You Were Offline</h2>
      <p>A visitor started a live chat session while you were offline. Log in to the admin panel to reply.</p>
      <div class="highlight-box">
        <table>
          <tr><td class="label">Visitor Name</td><td class="value">${guestName}</td></tr>
          <tr><td class="label">Visitor Email</td><td class="value">${guestEmail}</td></tr>
          <tr><td class="label">IP Address</td><td class="value">${guestIp || 'N/A'}</td></tr>
          <tr><td class="label">Session ID</td><td class="value" style="font-size:0.8rem;opacity:0.7">${sessionId}</td></tr>
        </table>
      </div>
      <center><a href="http://localhost:5173/admin/live-chat" class="btn">Open Live Chat Panel</a></center>
    `
    const html = getHtmlLayout('Live Chat — Missed Message', content)
    await transporter.sendMail({
      from: `"SpaceX Trading Monitoring" <${process.env.EMAIL_FROM || 'support@spacxtrading.online'}>`,
      to: adminEmail,
      subject: `💬 Missed Live Chat from ${guestName} (${guestEmail})`,
      html
    })
  },

  // 8b. Stock Investment Confirmed — sent to user
  async sendStockInvestmentConfirmed(toEmail, details) {
    const { stock, investedAmount, priceAtPurchase, sharesOwned, annualROI, dailyEarning, contractStart, contractEnd } = details
    const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const fmtUSD  = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    const content = `
      <h2>Stock Investment Contract Activated</h2>
      <p>Your investment contract in <strong>${stock?.name || details.stockName}</strong> (${details.symbol}) has been successfully activated. Earnings will accrue daily and be credited directly to your wallet balance.</p>
      <div class="highlight-box">
        <table>
          <tr><td class="label">Stock</td>          <td class="value">${stock?.name || details.stockName} (${details.symbol})</td></tr>
          <tr><td class="label">Sector</td>         <td class="value">${stock?.sector || '—'}</td></tr>
          <tr><td class="label">Amount Invested</td><td class="value" style="color:#0ea5e9;">${fmtUSD(investedAmount)}</td></tr>
          <tr><td class="label">Price at Purchase</td><td class="value">${fmtUSD(priceAtPurchase)}/share</td></tr>
          <tr><td class="label">Shares Owned</td>   <td class="value">${Number(sharesOwned).toFixed(6)}</td></tr>
          <tr><td class="label">Annual ROI</td>      <td class="value" style="color:#0ea5e9;">${annualROI}% per year</td></tr>
          <tr><td class="label">Daily Earnings</td>  <td class="value" style="color:#0ea5e9;">+${fmtUSD(dailyEarning)}/day</td></tr>
          <tr><td class="label">Contract Start</td>  <td class="value">${fmtDate(contractStart || new Date())}</td></tr>
          <tr><td class="label">Contract End</td>    <td class="value">${fmtDate(contractEnd)}</td></tr>
          <tr><td class="label">Duration</td>        <td class="value">${stock?.contractDays || '—'} Days</td></tr>
        </table>
      </div>
      <p>Your daily earnings of <strong>${fmtUSD(dailyEarning)}</strong> will be credited to your wallet continuously throughout the contract period.</p>
      <center><a href="http://spacxtrading.online/my-stocks" class="btn">View My Stock Portfolio</a></center>
    `
    const html = getHtmlLayout('Stock Investment Activated', content)
    await transporter.sendMail({
      from: `"SpaceX Trading Markets" <${process.env.EMAIL_FROM || 'support@spacxtrading.online'}>`,
      to: toEmail,
      subject: `📈 Stock Investment Activated — ${details.symbol} · $${Number(investedAmount).toFixed(2)}`,
      html
    })
  },

  // 8c. Admin alert for new stock investment
  async sendAdminStockAlert(adminEmail, userEmail, details) {
    const { stock, investedAmount, priceAtPurchase, sharesOwned, annualROI, contractEnd } = details
    const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const fmtUSD  = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    const content = `
      <h2>New Stock Investment Placed</h2>
      <p>A customer has purchased a stock investment contract on the platform.</p>
      <div class="highlight-box">
        <table>
          <tr><td class="label">Customer</td>       <td class="value">${userEmail}</td></tr>
          <tr><td class="label">Stock</td>           <td class="value">${stock?.name || details.stockName} (${details.symbol})</td></tr>
          <tr><td class="label">Amount</td>          <td class="value" style="color:#0ea5e9;">${fmtUSD(investedAmount)}</td></tr>
          <tr><td class="label">Price/Share</td>     <td class="value">${fmtUSD(priceAtPurchase)}</td></tr>
          <tr><td class="label">Shares</td>          <td class="value">${Number(sharesOwned).toFixed(6)}</td></tr>
          <tr><td class="label">Annual ROI</td>      <td class="value">${annualROI}%</td></tr>
          <tr><td class="label">Contract End</td>    <td class="value">${fmtDate(contractEnd)}</td></tr>
        </table>
      </div>
    `
    const html = getHtmlLayout('Admin: New Stock Investment', content)
    await transporter.sendMail({
      from: `"SpaceX Trading Admin" <${process.env.EMAIL_FROM || 'support@spacxtrading.online'}>`,
      to: adminEmail,
      subject: `📊 [ADMIN] New Stock Purchase — ${details.symbol} · ${fmtUSD(investedAmount)} by ${userEmail}`,
      html
    })
  },

  // 8. Send Custom Administration message directly to user's email
  async sendCustomAdminMessage(toEmail, subject, title, message) {
    const content = `
      <h2>${title || 'Platform Notice'}</h2>
      <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 22px; font-size: 15px; line-height: 1.6; color: #adadad; margin-bottom: 24px; white-space: pre-wrap; text-align: left;">${message}</div>
      <p>This is a direct message from SpaceX Trading mission control. If you have any questions, please contact our 24/7 technical support desk.</p>
    `
    const html = getHtmlLayout(subject || "Administration Message", content)
    await transporter.sendMail({
      from: `"SpaceX Trading Administration" <${process.env.EMAIL_FROM || 'support@spacxtrading.online'}>`,
      to: toEmail,
      subject: subject || "Administration Notice",
      html
    })
  }
}
