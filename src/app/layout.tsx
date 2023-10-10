import '../styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import theme from "@/theme/config";
import {ConfigProvider} from "antd";
import StyledComponentsRegistry from "@/lib/AntdRegistry";
import {site} from "@/configs/site";
import setupMocks from "@/mocks";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: {
        default: site.title,
        template: `%s | ${site.title}`,
    },
    description: site.description,
    robots: { index: true, follow: true },

};

// mock 开启
if(process.env.USE_MOCK == "true") {
    setupMocks();
}

function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <html lang="en">
        <body className={inter.className}>
          <StyledComponentsRegistry>
              <ConfigProvider theme={theme}>
                      <div className="flex flex-col md:flex-row h-screen bg-[#FCFCFD]">
                          {children}
                      </div>
              </ConfigProvider>
          </StyledComponentsRegistry>
        </body>
      </html>
  )
}

export default RootLayout;