# Password meter dependencies

The registration password meter uses `@zxcvbn-ts/core`, `@zxcvbn-ts/language-common`, and `@zxcvbn-ts/language-en`.

Estimation is performed locally. No breach-check matcher, telemetry, external password scoring endpoint, or remote AI integration is used. Local JavaScript chunks and dictionaries load on demand after typing. Scores are advisory and do not change the backend password policy or authentication API. The library detects common and English words and keyboard patterns; it is not a comprehensive Thai dictionary or a guarantee of security. Estimation examines at most 128 characters; submitted passwords are never truncated by the meter.

## Attribution

- zxcvbn-ts: https://github.com/zxcvbn-ts/zxcvbn (MIT; see installed package licenses).
- The English `commonWords` dictionary is generated from OpenSubtitles 2024, distributed via OPUS: https://opus.nlpl.eu/datasets/OpenSubtitles . The dataset uses the Open Data Commons Attribution License (ODC-BY): https://opendatacommons.org/licenses/by/1-0/ . Source: `@zxcvbn-ts/language-en/README.md`.
