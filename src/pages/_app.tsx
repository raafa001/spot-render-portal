import { AppProps } from "next/app";
import { LanguageProvider } from "../components/LanguageSelector";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <Component {...pageProps} />
    </LanguageProvider>
  );
}
