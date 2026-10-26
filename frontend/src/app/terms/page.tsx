'use client';

import Link from "next/link";
import Logo from "@/components/icons/Logo";

const sections = [
  {
    title: "1. Eligibility",
    body: "Access is limited to individuals with a valid university email address (@tuks.co.za or @up.ac.za) who complete our OTP verification process. You must provide accurate registration information and keep your login credentials confidential.",
  },
  {
    title: "2. Account Responsibility",
    body: "You're responsible for all activity under your account. Notify us immediately if you suspect unauthorized access. We may suspend or terminate accounts that violate these Terms, provide false information, or misuse the platform.",
  },
  {
    title: "3. Listings and Content",
    body: "When you create a listing, you confirm that the information (condition, pricing, module, photos) is accurate to the best of your knowledge. Listings are reviewed before becoming visible to other students. We may reject, remove, or soft-delete a listing at our discretion, including after it's approved.",
  },
  {
    title: "4. Transactions Between Users",
    body: "NexusDev is a listing and discovery platform. We are not a party to any sale, swap, or exchange arranged between students, and we do not process payments. Arrangements for meeting, payment, and exchange of goods are solely between the buyer and seller.",
  },
  {
    title: "5. Prohibited Conduct",
    body: "You agree not to misrepresent your identity or listings, use the platform for anything other than textbook-related listings, harass or abuse other users, attempt to circumvent verification or moderation, or use the platform for unlawful purposes.",
  },
  {
    title: "6. Moderation and Enforcement",
    body: "We reserve the right to review, approve, reject, or remove listings and user-generated content, and to suspend or ban accounts that breach these Terms.",
  },
  {
    title: "7. Disclaimers and Limitation of Liability",
    body: "The platform is provided \"as is.\" We do not guarantee uninterrupted or error-free service, and we are not liable for damages arising from your use of the platform or from transactions between users.",
  },
  {
    title: "8. Changes to These Terms",
    body: "We may update these Terms from time to time. Continued use of the platform after changes take effect constitutes acceptance of the revised Terms.",
  },
  {
    title: "9. Termination",
    body: "We may suspend or terminate your access at any time for violation of these Terms. You may stop using the platform and request account deletion at any time.",
  },
  {
    title: "10. Governing Law",
    body: "These Terms are governed by the laws of the Republic of South Africa.",
  },
];

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-xs mt-2" style={{ color: "#4B4F58" }}>
            Last updated: [1 October 2026] &middot; Capstone Project - for demonstration
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
            Welcome to NexusDev (&quot;we&quot;, &quot;us&quot;,
            &quot;our&quot;). These Terms of Service (&quot;Terms&quot;)
            govern your use of our platform, which connects verified
            university students to buy, sell, and swap textbooks. By
            creating an account, you agree to these Terms.
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
                11. Contact
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#3a3a3a" }}>
                Questions about these Terms can be sent to{" "}
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