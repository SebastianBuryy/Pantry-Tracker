'use client';

import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Navbar from "./navbar/page";

import { Raleway } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";

import theme from "./theme";
import { metadata } from './metadata';
import Features from "./components/features";

const raleway = Raleway({ subsets: ["latin"] });


export default function RootLayout({ children }) {
  return (
      <html lang="en">
        <head>
          <title>{metadata.title}</title>
          <meta name="description" content={metadata.description} />
        </head>
        <body className={raleway.className}>
          <ThemeProvider theme={theme}>
          <Navbar />
          {children}
          </ThemeProvider>
        </body>
      </html>
  );
}