// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  modules: ["@vueuse/nuxt", "@nuxtjs/tailwindcss"],
  app: {
    cdnURL: "/rubics/",
  },
});
