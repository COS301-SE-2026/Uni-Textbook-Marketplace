"use client";

import Link from "next/link";
import Logo from "@/components/icons/Logo";

const sections = [
  {
    title: "1. Information We Collect",
    body: "When you register, we collect your name, surname, university email address, and password. When you use the platform, we collect the listings you create (book details, condition, price, photos), your module selections, and messages you send to other users.",
  },
  {
    title: "2. Verification",
    body: "We verify your university affiliation by sending a one-time password (OTP) to your university email address (@tuks.co.za or @up.ac.za). We do not accept non-university email addresses.",
  },
  {
    title: "3. How We Use Your Information",
    body: "We use your information to operate your account, verify your student status, display your listings to other students, enable messaging between buyers and sellers, and moderate content on the platform.",
  },
  {
    title: "4. What Other Users Can See",
    body: "Your name and listings are visible to other verified students on the platform. Your password is never visible to anyone, including us — it is stored in hashed form.",
  },
  {
    title: "5. Data Sharing",
    body: "We do not sell your information. We do not share your data with third parties except where required to operate the platform (such as our cloud hosting and storage providers) or where required by law.",
  },
  {
    title: "6. Data Retention",
    body: "We retain your account and listing data for as long as your account is active. Removed listings are soft-deleted and retained for moderation and audit purposes rather than immediately erased.",
  },
  {
    title: "7. Your Choices",
    body: "You may update your account information at any time. You may request deletion of your account and associated data by contacting us.",
  },
  {
    title: "8. Security",
    body: "We take reasonable measures to protect your information, including hashed passwords and OTP-based verification. No system is completely secure, and we cannot guarantee absolute security.",
  },
  {
    title: "9. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Continued use of the platform after changes take effect constitutes acceptance of the revised Policy.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main
      className="min-h-screen w-full flex justify-center px-4 py-12 md:py-16"
      style={{ background: "#F5F5F5" }}
    >
      <div style={{ width: "100%", maxWidth: 720 }}>
        <div className="flex flex-col items-center text-center mb-10">
          <Logo className="w-14 h-auto mb-4" />
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ color: "#000f2b" }}
          >
            Privacy Policy
          </h1>
          <p className="text-xs mt-2" style={{ color: "#4B4F58" }}>
            Last updated: [date] &middot; Capstone Project — for demonstration
            purposes only
          </p>
        </div>

        <div
          className="rounded-lg p-6 md:p-10"
          style={{
            background: "#FFFFFF",
            border: "1px solid #dddddd",
          }}
        >
          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: "#3a3a3a" }}
          >
            This Privacy Policy explains what information NexusDev
            (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects from
            you, how we use it, and the choices you have. By using the
            platform, you agree to the collection and use of information
            as described here.
          </p>

          <div className="flex flex-col gap-6">
            {sections.map((section) => (
              <div key={section.title}>
                <h2
                  className="text-sm font-semibold mb-1.5"
                  style={{ color: "#000f2b" }}
                >
                  {section.title}
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#3a3a3a" }}
                >
                  {section.body}
                </p>
              </div>
            ))}

            <div>
              <h2
                className="text-sm font-semibold mb-1.5"
                style={{ color: "#000f2b" }}
              >
                10. Contact
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#3a3a3a" }}>
                Questions about this Policy can be sent to{" "}
                <a
                  href="mailto:nexusdev.cos301@gmail.com"
                  style={{ color: "#006D8A" }}
                >
                  nexusdev.cos301@gmail.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Link
            href="/auth/register"
            className="text-sm font-medium"
            style={{ color: "#006D8A" }}
          >
            &larr; Back to Register
          </Link>
        </div>
      </div>
    </main>
  );
}