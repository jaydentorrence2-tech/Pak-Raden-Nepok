import React from 'react';
import { HandSkinId } from '../data/scenarios';

export type CharacterMood = 'polos' | 'slapped' | 'perfect' | 'missed' | 'gameover';

interface CartoonCharacterProps {
  mood: CharacterMood;
  handSkin: HandSkinId;
}

export const CartoonCharacter: React.FC<CartoonCharacterProps> = ({ mood, handSkin }) => {
  const isHit = mood === 'slapped' || mood === 'perfect';
  const isPerfect = mood === 'perfect';
  const isMissed = mood === 'missed';
  const isGameOver = mood === 'gameover';

  return (
    <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72 select-none">
      {/* Comic starburst behind character on hit */}
      {isHit && (
        <div
          className="absolute -top-2 -right-2 sm:right-0 z-20 pointer-events-none animate-slap-pop"
          aria-hidden="true"
        >
          <svg width="112" height="86" viewBox="0 0 112 86" className="overflow-visible">
            <polygon
              points="56,4 69,24 96,12 84,36 108,48 83,58 95,80 68,69 54,84 42,67 16,78 27,54 4,42 29,32 18,10 44,22"
              fill={isPerfect ? '#FACC15' : '#FB923C'}
              stroke="#1E1B18"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <text
              x="56"
              y={isPerfect ? '43' : '49'}
              textAnchor="middle"
              fill="#1E1B18"
              fontFamily="Bricolage Grotesque, sans-serif"
              fontWeight="800"
              fontSize={isPerfect ? '19' : '21'}
            >
              {isPerfect ? 'PLAK!!' : 'PLAK!'}
            </text>
            {isPerfect && (
              <text
                x="56"
                y="60"
                textAnchor="middle"
                fill="#DC2626"
                fontFamily="Bricolage Grotesque, sans-serif"
                fontWeight="800"
                fontSize="11"
              >
                MANTAP!
              </text>
            )}
          </svg>
        </div>
      )}

      {/* Miss stamp */}
      {isMissed && (
        <div
          className="absolute top-1 -left-2 sm:left-0 z-20 pointer-events-none animate-slap-pop"
          aria-hidden="true"
        >
          <div className="bg-amber-300 border-[3px] border-[#1E1B18] px-3 py-1 rounded-md comic-shadow-sm -rotate-12">
            <span className="font-display font-extrabold text-sm tracking-wide text-[#1E1B18]">
              MELESET!
            </span>
          </div>
        </div>
      )}

      {/* Main SVG Character (expanded upwards for extra-long forehead) */}
      <svg
        viewBox="0 -68 240 296"
        className={`w-full h-full overflow-visible transition-transform duration-150 ${
          mood === 'polos' ? 'animate-bob' : ''
        } ${isMissed ? 'translate-x-3 rotate-3' : ''} ${isHit ? 'scale-y-95 translate-y-1' : ''}`}
        role="img"
        aria-label={
          isHit
            ? 'Pak Raden berjidat panjang sedang menepuk jidat karena malu'
            : isMissed
            ? 'Pak Raden berjidat panjang lolos dari tepokan dengan ekspresi jahil'
            : isGameOver
            ? 'Pak Raden berjidat panjang pusing karena jidatnya terlalu sering lolos'
            : 'Pak Raden berjidat panjang berekspresi polos sebelum ditepok'
        }
      >
        {/* Ground shadow */}
        <ellipse cx="120" cy="216" rx="68" ry="10" fill="rgba(30,27,24,0.12)" />

        {/* Classic Bapak-Bapak Collared Shirt / Safari */}
        <path
          d="M46,214 C50,170 76,160 120,160 C164,160 190,170 194,214 Z"
          fill="#0F766E"
          stroke="#1E1B18"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Shirt collar lapels */}
        <path
          d="M92,162 L108,180 L120,168 L132,180 L148,162"
          fill="#CCFBF1"
          stroke="#1E1B18"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        {/* Shirt center line & button */}
        <line x1="120" y1="168" x2="120" y2="214" stroke="#1E1B18" strokeWidth="2.5" />
        <circle cx="120" cy="186" r="2.5" fill="#FDE68A" stroke="#1E1B18" strokeWidth="1.5" />

        {/* NAME TAG: PAK RADEN pinned on chest */}
        <g transform="translate(128, 178) rotate(-2)">
          <rect
            x="0"
            y="0"
            width="68"
            height="24"
            rx="4"
            fill="#FFFFFF"
            stroke="#1E1B18"
            strokeWidth="2.8"
          />
          <rect x="2" y="2" width="64" height="5" rx="1.5" fill="#DC2626" />
          <text
            x="34"
            y="18.5"
            textAnchor="middle"
            fill="#1E1B18"
            fontFamily="Bricolage Grotesque, sans-serif"
            fontWeight="800"
            fontSize="10.5"
            letterSpacing="0.3"
          >
            PAK RADEN
          </text>
        </g>

        {/* Neck */}
        <rect
          x="105"
          y="142"
          width="30"
          height="24"
          rx="8"
          fill="#EDC09B"
          stroke="#1E1B18"
          strokeWidth="4"
        />

        {/* Ears with subtle tufts */}
        <circle cx="61" cy="110" r="14" fill="#EDC09B" stroke="#1E1B18" strokeWidth="4" />
        <path d="M58,105 Q54,110 59,115" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="179" cy="110" r="14" fill="#EDC09B" stroke="#1E1B18" strokeWidth="4" />
        <path d="M182,105 Q186,110 181,115" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />

        {/* Tall Head / Giant Elongated Forehead Base */}
        <rect
          x="64"
          y="-38"
          width="112"
          height="190"
          rx="52"
          fill={isHit ? '#FCA5A5' : '#F4C9A4'}
          stroke="#1E1B18"
          strokeWidth="4"
          className="transition-colors duration-150"
        />

        {/* Forehead age / worry lines on the tall forehead */}
        <g opacity="0.45" stroke="#1E1B18" strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M90,46 Q120,40 150,46" />
          <path d="M96,57 Q120,52 144,57" />
        </g>

        {/* Comic shiny forehead gleam when not hit */}
        {!isHit && (
          <g opacity="0.65">
            <path
              d="M84,2 Q86,-16 98,-20"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <circle cx="83" cy="12" r="2.5" fill="#FFFFFF" />
          </g>
        )}

        {/* Big Forehead Red Slap Glow when hit */}
        {isHit && (
          <g>
            <ellipse cx="120" cy="24" rx="40" ry="30" fill="#EF4444" opacity="0.55" />
            <ellipse cx="120" cy="24" rx="26" ry="19" fill="#DC2626" opacity="0.65" />
          </g>
        )}

        {/* Receding Salt-and-Pepper Hair pushed way up on the towering forehead */}
        <path
          d="M64,-8 C62,-38 86,-54 120,-54 C154,-54 178,-38 176,-8 C172,-22 162,-28 148,-28 C134,-28 130,-38 120,-38 C110,-38 106,-28 92,-28 C78,-28 68,-22 64,-8 Z"
          fill="#57534E"
          stroke="#1E1B18"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Silver / Uban sideburns & hair streaks */}
        <path
          d="M65,-6 C63,12 64,34 65,58"
          fill="none"
          stroke="#D6D3D1"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M65,-6 C63,12 64,34 65,58"
          fill="none"
          stroke="#1E1B18"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M175,-6 C177,12 176,34 175,58"
          fill="none"
          stroke="#D6D3D1"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M175,-6 C177,12 176,34 175,58"
          fill="none"
          stroke="#1E1B18"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Uban streak in hair */}
        <path d="M88,-44 Q102,-46 108,-38" fill="none" stroke="#E7E5E4" strokeWidth="4" strokeLinecap="round" />
        <path d="M138,-44 Q150,-42 156,-34" fill="none" stroke="#E7E5E4" strokeWidth="3.5" strokeLinecap="round" />

        {/* Blushing cheeks + age laugh creases */}
        <ellipse
          cx="80"
          cy="118"
          rx="9"
          ry="5.5"
          fill="#FB7185"
          opacity={isHit ? 0.85 : 0.35}
        />
        <ellipse
          cx="160"
          cy="118"
          rx="9"
          ry="5.5"
          fill="#FB7185"
          opacity={isHit ? 0.85 : 0.35}
        />
        {/* Crow's feet / laugh lines */}
        <path d="M77,114 Q73,120 77,126" fill="none" stroke="#1E1B18" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
        <path d="M163,114 Q167,120 163,126" fill="none" stroke="#1E1B18" strokeWidth="2" strokeLinecap="round" opacity="0.45" />

        {/* Under-eye bags (older look) */}
        <path d="M86,112 Q96,117 106,112" fill="none" stroke="#1E1B18" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
        <path d="M134,112 Q144,117 154,112" fill="none" stroke="#1E1B18" strokeWidth="2" strokeLinecap="round" opacity="0.45" />

        {/* Bushy graying Eyebrows & Eyes */}
        {mood === 'polos' && (
          <g>
            {/* Bushy thick bapak eyebrows */}
            <path d="M82,81 Q95,72 108,80" fill="none" stroke="#57534E" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M82,81 Q95,72 108,80" fill="none" stroke="#1E1B18" strokeWidth="2" strokeLinecap="round" />
            <path d="M132,80 Q145,72 158,81" fill="none" stroke="#57534E" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M132,80 Q145,72 158,81" fill="none" stroke="#1E1B18" strokeWidth="2" strokeLinecap="round" />
            {/* Innocent eyes */}
            <circle cx="96" cy="98" r="10.5" fill="#FFFFFF" stroke="#1E1B18" strokeWidth="2.8" />
            <circle cx="98" cy="98" r="4.5" fill="#1E1B18" />
            <circle cx="100" cy="95.5" r="1.8" fill="#FFFFFF" />

            <circle cx="144" cy="98" r="10.5" fill="#FFFFFF" stroke="#1E1B18" strokeWidth="2.8" />
            <circle cx="142" cy="98" r="4.5" fill="#1E1B18" />
            <circle cx="144" cy="95.5" r="1.8" fill="#FFFFFF" />
          </g>
        )}

        {isHit && (
          <g>
            {/* Bushy eyebrows pinched */}
            <path d="M82,84 L106,89" fill="none" stroke="#57534E" strokeWidth="5" strokeLinecap="round" />
            <path d="M158,84 L134,89" fill="none" stroke="#57534E" strokeWidth="5" strokeLinecap="round" />
            {/* Squeezed > < eyes */}
            <path d="M85,92 L104,98 L85,104" fill="none" stroke="#1E1B18" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M155,92 L136,98 L155,104" fill="none" stroke="#1E1B18" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {isMissed && (
          <g>
            {/* Smug side-eye */}
            <path d="M82,82 Q95,78 108,83" fill="none" stroke="#57534E" strokeWidth="5" strokeLinecap="round" />
            <path d="M132,79 Q145,72 158,80" fill="none" stroke="#57534E" strokeWidth="5" strokeLinecap="round" />
            <circle cx="96" cy="98" r="10" fill="#FFFFFF" stroke="#1E1B18" strokeWidth="2.8" />
            <circle cx="101" cy="98" r="4.5" fill="#1E1B18" />
            <circle cx="144" cy="98" r="10" fill="#FFFFFF" stroke="#1E1B18" strokeWidth="2.8" />
            <circle cx="149" cy="98" r="4.5" fill="#1E1B18" />
          </g>
        )}

        {isGameOver && (
          <g>
            {/* Dizzy spiral eyes */}
            <circle cx="96" cy="98" r="10.5" fill="#FFFFFF" stroke="#1E1B18" strokeWidth="2.8" />
            <path d="M96,98 m-5,0 a5,5 0 1,0 10,0 a3,3 0 1,0 -6,0" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="144" cy="98" r="10.5" fill="#FFFFFF" stroke="#1E1B18" strokeWidth="2.8" />
            <path d="M144,98 m-5,0 a5,5 0 1,0 10,0 a3,3 0 1,0 -6,0" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
            {/* Bandaid X on the towering forehead */}
            <g transform="translate(120, 22) rotate(-15)">
              <rect x="-22" y="-7" width="44" height="14" rx="4" fill="#FDE68A" stroke="#1E1B18" strokeWidth="2.5" />
              <line x1="-8" y1="-7" x2="-8" y2="7" stroke="#1E1B18" strokeWidth="1.5" opacity="0.4" />
              <line x1="8" y1="-7" x2="8" y2="7" stroke="#1E1B18" strokeWidth="1.5" opacity="0.4" />
            </g>
            <g transform="translate(120, 22) rotate(35)">
              <rect x="-22" y="-7" width="44" height="14" rx="4" fill="#FDE68A" stroke="#1E1B18" strokeWidth="2.5" />
              <line x1="-8" y1="-7" x2="-8" y2="7" stroke="#1E1B18" strokeWidth="1.5" opacity="0.4" />
              <line x1="8" y1="-7" x2="8" y2="7" stroke="#1E1B18" strokeWidth="1.5" opacity="0.4" />
            </g>
          </g>
        )}

        {/* Classic Round Reading Glasses (tilts slightly on slap!) */}
        <g transform={isHit ? 'rotate(-5 120 98) translate(0, 2)' : undefined}>
          <circle cx="96" cy="98" r="14.5" fill="rgba(255,255,255,0.18)" stroke="#1E1B18" strokeWidth="2.8" />
          <circle cx="144" cy="98" r="14.5" fill="rgba(255,255,255,0.18)" stroke="#1E1B18" strokeWidth="2.8" />
          <path d="M110.5,98 Q120,94 129.5,98" fill="none" stroke="#1E1B18" strokeWidth="2.8" />
          <line x1="66" y1="96" x2="81.5" y2="98" stroke="#1E1B18" strokeWidth="2.5" />
          <line x1="158.5" y1="98" x2="174" y2="96" stroke="#1E1B18" strokeWidth="2.5" />
        </g>

        {/* Nose */}
        <path d="M117,104 Q124,111 117,115" fill="none" stroke="#1E1B18" strokeWidth="3" strokeLinecap="round" />

        {/* Mouth */}
        {mood === 'polos' && (
          <g>
            {/* Friendly bapak smile */}
            <path d="M102,128 Q120,143 138,128 Z" fill="#FFFFFF" stroke="#1E1B18" strokeWidth="2.8" strokeLinejoin="round" />
          </g>
        )}

        {isHit && (
          /* Wavy embarrassed mouth */
          <path
            d="M102,133 Q108,127 114,133 Q120,139 126,133 Q132,127 138,133"
            fill="none"
            stroke="#1E1B18"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        )}

        {isMissed && (
          /* Cheeky smirk */
          <path
            d="M104,130 Q123,140 139,126"
            fill="none"
            stroke="#1E1B18"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        )}

        {isGameOver && (
          /* Wobbly O mouth */
          <ellipse cx="120" cy="133" rx="8" ry="6.5" fill="#7F1D1D" stroke="#1E1B18" strokeWidth="2.8" />
        )}

        {/* Signature Thick Pak Raden Mustache (Kumis Tebal) */}
        <path
          d="M92,124 C95,114 111,115 120,121 C129,115 145,114 148,124 C143,129 131,128 120,124 C109,128 97,129 92,124 Z"
          fill="#44403C"
          stroke="#1E1B18"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Subtle gray uban highlight on mustache */}
        <path d="M99,121 Q108,118 114,121" fill="none" stroke="#D6D3D1" strokeWidth="2" strokeLinecap="round" />
        <path d="M126,121 Q132,118 141,121" fill="none" stroke="#D6D3D1" strokeWidth="2" strokeLinecap="round" />

        {/* Comical Sweat Drops along the tall forehead */}
        {(isHit || isMissed) && (
          <g className="animate-sweat">
            <path
              d="M174,-4 C174,-4 183,9 183,14 C183,19 179,23 174,23 C169,23 165,19 165,14 C165,9 174,-4 174,-4 Z"
              fill="#38BDF8"
              stroke="#1E1B18"
              strokeWidth="2.5"
            />
          </g>
        )}

        {/* Dizzy stars above the tall forehead */}
        {(isPerfect || isGameOver) && (
          <g fill="#FACC15" stroke="#1E1B18" strokeWidth="2">
            <polygon points="52,-38 55,-31 62,-31 56,-27 58,-20 52,-24 46,-20 48,-27 42,-31 49,-31" />
            <polygon points="186,-42 189,-35 196,-35 190,-31 192,-24 186,-28 180,-24 182,-31 176,-35 183,-35" />
          </g>
        )}

        {/* Resting Hands (visible when NOT slapping) */}
        {!isHit && (
          <g>
            <circle cx="70" cy="198" r="14" fill="#F4C9A4" stroke="#1E1B18" strokeWidth="3.5" />
            <circle cx="170" cy="198" r="14" fill="#F4C9A4" stroke="#1E1B18" strokeWidth="3.5" />
          </g>
        )}

        {/* SLAPPING HAND ON THE LONG FOREHEAD (visible when hit!) */}
        {isHit && (
          <g className="animate-slap-pop" style={{ transformOrigin: '120px 26px' }}>
            {/* Long arm reaching all the way up to the tall forehead */}
            <path
              d="M66,214 L92,50 L122,54 L94,214 Z"
              fill={handSkin === 'robot' ? '#94A3B8' : handSkin === 'fire' ? '#F97316' : '#FCD5B5'}
              stroke="#1E1B18"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Hand shifted up onto the tall forehead */}
            <g transform="translate(0, -44)">
              {handSkin === 'fire' && (
                /* Flame aura around slap */
                <path
                  d="M84,88 C74,56 96,42 104,26 C114,42 126,20 136,40 C152,32 162,56 150,86 Z"
                  fill="#F97316"
                  stroke="#1E1B18"
                  strokeWidth="3"
                  opacity="0.9"
                />
              )}

              <g
                transform={
                  handSkin === 'giant'
                    ? 'translate(120, 68) scale(1.32) translate(-120, -68)'
                    : undefined
                }
              >
                {/* Palm + 4 fingers slapping forehead */}
                <path
                  d="M90,98 L88,60 C88,54 96,54 96,60 L98,74 L100,48 C100,41 109,41 109,48 L110,72 L113,44 C113,37 122,37 122,44 L123,72 L127,50 C127,43 136,44 136,51 L135,84 L145,74 C150,69 156,75 151,81 L133,103 C124,112 94,110 90,98 Z"
                  fill={
                    handSkin === 'robot'
                      ? '#CBD5E1'
                      : handSkin === 'fire'
                      ? '#FACC15'
                      : '#FCD5B5'
                  }
                  stroke="#1E1B18"
                  strokeWidth="3.8"
                  strokeLinejoin="round"
                />

                {/* Robot bolts & glowing stripe */}
                {handSkin === 'robot' && (
                  <g>
                    <rect x="102" y="80" width="22" height="8" rx="3" fill="#0EA5E9" stroke="#1E1B18" strokeWidth="2" />
                    <circle cx="98" cy="96" r="2.5" fill="#475569" />
                    <circle cx="128" cy="96" r="2.5" fill="#475569" />
                  </g>
                )}

                {/* Comic slap impact lines */}
                <line x1="78" y1="68" x2="64" y2="62" stroke="#1E1B18" strokeWidth="3" strokeLinecap="round" />
                <line x1="80" y1="54" x2="68" y2="43" stroke="#1E1B18" strokeWidth="3" strokeLinecap="round" />
                <line x1="146" y1="52" x2="158" y2="42" stroke="#1E1B18" strokeWidth="3" strokeLinecap="round" />
                <line x1="152" y1="68" x2="166" y2="64" stroke="#1E1B18" strokeWidth="3" strokeLinecap="round" />
              </g>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
