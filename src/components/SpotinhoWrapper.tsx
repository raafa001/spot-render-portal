import SpotinhoWidget from "./SpotinhoWidget";

interface SpotinhoWrapperProps {
  children: React.ReactNode;
}

export default function SpotinhoWrapper({ children }: SpotinhoWrapperProps) {
  return (
    <>
      {children}
      <SpotinhoWidget />
    </>
  );
}
