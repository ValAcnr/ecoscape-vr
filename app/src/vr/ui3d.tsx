import { useState, type ReactNode } from 'react'
import { RoundedBox, Text } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import displayFont from '@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff?url'
import bodyFont from '@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff?url'
import boldFont from '@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff?url'

export const C = {
  honey: '#ffc533', ink: '#161320', leaf: '#2fa36b', lilac: '#b9a4ff', petal: '#ff6f91', cream: '#fff8e6', paper: '#ffffff', sky: '#cfe6ff',
}
export const FONTS = { display: displayFont, body: bodyFont, bold: boldFont }

/** Flat rounded panel with an ink "shadow" — the Bloom card, in 3D. */
export function Panel({ w, h, color = C.paper, children, position, rotation }: { w: number; h: number; color?: string; children?: ReactNode; position?: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[w, h, 0.02]} radius={0.04} smoothness={4} position={[0.025, -0.025, -0.015]}>
        <meshBasicMaterial color={C.ink} />
      </RoundedBox>
      <RoundedBox args={[w, h, 0.03]} radius={0.04} smoothness={4}>
        <meshBasicMaterial color={color} toneMapped={false} />
      </RoundedBox>
      <group position={[0, 0, 0.02]}>{children}</group>
    </group>
  )
}

export function Label({ children, size = 0.08, color = C.ink, font = 'body', position, maxWidth, anchorX = 'center', anchorY = 'middle', lineHeight = 1.2 }: {
  children: string; size?: number; color?: string; font?: keyof typeof FONTS; position?: [number, number, number]; maxWidth?: number; anchorX?: 'left' | 'center' | 'right'; anchorY?: 'top' | 'middle' | 'bottom'; lineHeight?: number
}) {
  return (
    <Text font={FONTS[font]} fontSize={size} color={color} position={position} maxWidth={maxWidth} anchorX={anchorX} anchorY={anchorY} lineHeight={lineHeight}>
      {children}
    </Text>
  )
}

/** Clickable pill button — works with mouse, touch and XR controller rays (pointer events). */
export function Button3D({ label, onClick, position, w = 0.9, h = 0.18, primary = true, disabled = false }: { label: string; onClick: () => void; position?: [number, number, number]; w?: number; h?: number; primary?: boolean; disabled?: boolean }) {
  const [hover, setHover] = useState(false)
  const bg = disabled ? '#d8d0bd' : primary ? (hover ? '#2b2538' : C.ink) : hover ? '#ffe08a' : C.honey
  const fg = primary ? C.honey : C.ink
  return (
    <group
      position={position}
      scale={hover && !disabled ? 1.05 : 1}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(true); document.body.style.cursor = disabled ? 'default' : 'pointer' }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = 'default' }}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); if (!disabled) onClick() }}
    >
      <RoundedBox args={[w, h, 0.03]} radius={h / 2 - 0.005} smoothness={6} position={[0.015, -0.015, -0.01]}>
        <meshBasicMaterial color={C.ink} />
      </RoundedBox>
      <RoundedBox args={[w, h, 0.04]} radius={h / 2 - 0.005} smoothness={6}>
        <meshBasicMaterial color={bg} toneMapped={false} />
      </RoundedBox>
      <Label size={h * 0.4} font="bold" color={disabled ? '#8a8396' : fg} position={[0, 0, 0.03]}>{label}</Label>
    </group>
  )
}

export function Chip({ label, color, position, w = 0.36 }: { label: string; color: string; position?: [number, number, number]; w?: number }) {
  return (
    <group position={position}>
      <RoundedBox args={[w, 0.09, 0.02]} radius={0.04} smoothness={4}>
        <meshBasicMaterial color={color} toneMapped={false} />
      </RoundedBox>
      <Label size={0.042} font="bold" position={[0, 0, 0.015]}>{label}</Label>
    </group>
  )
}
