interface LogoProps {
  size?: number;
}

export function Logo({ size = 36 }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Accessibility Tracker logo"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  );
}
