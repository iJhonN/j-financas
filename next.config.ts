import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  register: true,
  // CORREÇÃO: Removido 'skipWaiting' da raiz, pois a biblioteca já trata isso internamente 
  // ou através da propriedade 'workboxOptions' se você quisesse customizar.
});

const nextConfig: NextConfig = {
  /* Suas outras configurações aqui */
};

export default withPWA(nextConfig);