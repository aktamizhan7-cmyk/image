import React from 'react';

interface SpidyLogoProps {
  className?: string;
  size?: number;
}

/**
 * Authentic Insomniac Games / Marvel's Spider-Man White Spider Emblem.
 * Faithfully reproduces the chest insignia with precision vector geometry:
 * - 4 upper legs (2 inner needles, 2 outer sickle legs)
 * - 4 lower legs (2 outer downward fangs, 2 long sweeping crescent fangs)
 * - Central head with top pincers, diamond thorax, and tapered abdomen.
 */
export const SpidyLogo: React.FC<SpidyLogoProps> = ({ className = 'w-5 h-5', size }) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 500 700"
      fill="currentColor"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SPIDY Insignia"
    >
      <g>
        {/* ================= CENTER BODY ================= */}
        {/* Head & Upper Pincers */}
        <path
          d="
            M 250,185
            C 244,175 238,160 236,148
            C 238,164 242,176 245,188
            C 241,202 240,218 242,230
            C 236,238 228,250 228,270
            C 228,285 233,300 236,310
            C 228,330 218,365 218,405
            C 218,442 230,482 246,518
            L 250,526
            L 254,518
            C 270,482 282,442 282,405
            C 282,365 272,330 264,310
            C 267,300 272,285 272,270
            C 272,250 264,238 258,230
            C 260,218 259,202 255,188
            C 258,176 262,164 264,148
            C 262,160 256,175 250,185
            Z
          "
        />

        {/* ================= RIGHT LEGS ================= */}
        {/* Right Leg 1: Inner Upper Needle */}
        <path
          d="
            M 256,225
            C 264,198 280,148 322,78
            C 313,116 298,172 283,218
            C 278,233 270,242 262,246
            Z
          "
        />

        {/* Right Leg 2: Outer Upper Sickle */}
        <path
          d="
            M 268,248
            L 316,214
            C 336,184 366,138 412,108
            C 410,154 396,204 391,222
            L 326,260
            L 268,266
            Z
          "
        />

        {/* Right Leg 3: Outer Lower Fang */}
        <path
          d="
            M 268,274
            L 331,271
            L 412,301
            C 402,352 394,412 389,466
            C 381,418 366,358 341,322
            L 268,289
            Z
          "
        />

        {/* Right Leg 4: Inner Lower Sweeping Crescent */}
        <path
          d="
            M 265,299
            L 331,329
            C 362,377 364,453 344,534
            C 328,590 308,630 288,655
            C 314,615 336,544 331,463
            C 326,397 298,346 259,321
            Z
          "
        />

        {/* ================= LEFT LEGS (Mirrored) ================= */}
        {/* Left Leg 1: Inner Upper Needle */}
        <path
          d="
            M 244,225
            C 236,198 220,148 178,78
            C 187,116 202,172 217,218
            C 222,233 230,242 238,246
            Z
          "
        />

        {/* Left Leg 2: Outer Upper Sickle */}
        <path
          d="
            M 232,248
            L 184,214
            C 164,184 134,138 88,108
            C 90,154 104,204 109,222
            L 174,260
            L 232,266
            Z
          "
        />

        {/* Left Leg 3: Outer Lower Fang */}
        <path
          d="
            M 232,274
            L 169,271
            L 88,301
            C 98,352 106,412 111,466
            C 119,418 134,358 159,322
            L 232,289
            Z
          "
        />

        {/* Left Leg 4: Inner Lower Sweeping Crescent */}
        <path
          d="
            M 235,299
            L 169,329
            C 138,377 136,453 156,534
            C 172,590 192,630 212,655
            C 186,615 164,544 169,463
            C 174,397 202,346 241,321
            Z
          "
        />
      </g>
    </svg>
  );
};
