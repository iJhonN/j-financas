import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  // ADICIONE ESTA LINHA ABAIXO PARA CORRIGIR O ERRO DA IMAGEM:
  turbopack: {}, 
  
  /* Suas outras configurações aqui */
};

export default withPWA(nextConfig);