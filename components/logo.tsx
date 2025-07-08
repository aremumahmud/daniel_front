import Image from 'next/image'

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/download.jpeg"
        alt="University of Ilorin Logo"
        width={40}
        height={40}
        className="rounded-full object-cover"
      />
      <h1 className="text-2xl font-bold tracking-tight text-primary">
        <span className="font-serif italic">UniHealth</span>
      </h1>
    </div>
  )
}
