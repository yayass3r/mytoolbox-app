import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0d9488",
};

const SITE_URL = "https://personal-projects-toolbox-pro.appwrite.network";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "مجموعة أدواتي - 14 أداة مجانية للجميع | مولد كلمات المرور، محول الصور، PDF، QR Code",
  description:
    "مجموعة أدوات مجانية للجميع - 14 أداة متعددة الاستخدامات: مولد كلمات المرور، محول الألوان، محول الوحدات، عداد الكلمات، منسق JSON، تشفير Base64، حاسبة، مؤقت، محول النصوص، مولد QR، صور إلى PDF، تغيير حجم الصور، تحويل صيغة الصور، ضغط الصور",
  keywords: [
    "أدوات مجانية", "أدوات online", "مولد كلمات المرور", "محول الألوان",
    "محول الوحدات", "عداد الكلمات", "منسق JSON", "تشفير Base64", "حاسبة",
    "مولد QR Code", "تحويل الصور إلى PDF", "تغيير حجم الصور", "ضغط الصور",
    "تحويل صيغة الصور", "صور إلى PDF", "أدوات التصميم", "أدوات النصوص",
    "web tools", "free tools", "online tools", "password generator",
    "image converter", "QR code generator", "unit converter", "color converter",
  ],
  authors: [{ name: "مجموعة أدواتي" }],
  creator: "مجموعة أدواتي",
  publisher: "مجموعة أدواتي",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "مجموعة أدواتي",
  },
  openGraph: {
    title: "مجموعة أدواتي - 14 أداة مجانية للجميع",
    description: "أدوات مجانية متعددة الاستخدامات: مولد كلمات المرور، محول الصور، QR Code، PDF، وأكثر. استخدمها مجاناً الآن!",
    url: SITE_URL,
    siteName: "مجموعة أدواتي",
    images: [
      {
        url: "/og-image.png",
        width: 1024,
        height: 1024,
        alt: "مجموعة أدواتي - 14 أداة مجانية",
      },
    ],
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "مجموعة أدواتي - 14 أداة مجانية للجميع",
    description: "أدوات مجانية متعددة الاستخدامات: مولد كلمات المرور، محول الصور، QR Code، PDF، وأكثر.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

// JSON-LD Structured Data
function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "مجموعة أدواتي",
    description: "مجموعة أدوات مجانية للجميع - 14 أداة متعددة الاستخدامات",
    url: SITE_URL,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "SAR",
    },
    browserRequirements: "Requires JavaScript",
    featureList: [
      "مولد كلمات المرور",
      "محول الألوان",
      "محول الوحدات",
      "عداد الكلمات",
      "منسق JSON",
      "تشفير Base64",
      "حاسبة متقدمة",
      "مؤقت وموقف",
      "محول حالة النص",
      "مولد QR Code",
      "صور إلى PDF",
      "تغيير حجم الصور",
      "تحويل صيغة الصور",
      "ضغط الصور",
    ],
    inLanguage: "ar",
    author: {
      "@type": "Organization",
      name: "مجموعة أدواتي",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <StructuredData />
        <meta name="google-site-verification" content="" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
