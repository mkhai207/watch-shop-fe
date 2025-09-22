// src/components/ui/card.tsx
export function Card({ children, className }: any) {
  return <div className={`bg-white rounded-xl ${className}`}>{children}</div>;
}

export function CardHeader({ children, className }: any) {
  return <div className={`border-b p-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className }: any) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
}

export function CardContent({ children, className }: any) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
