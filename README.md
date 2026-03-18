# banksalad-mock-admin

개발계 테스트 데이터 조작용 React 어드민입니다.

## 화면

- 로그인 페이지
- SMS 인증 페이지 흐름
- 휴대폰번호 기준 테스트 데이터 토글 화면

## 실행

```bash
nvm install 20
nvm use 20
yarn install
yarn dev
```

기본 개발 서버 포트는 `3010`입니다.

- 권장 Node 버전: `20`
- Vite 5 기준으로 `Node 18+` 환경이 필요합니다.

## 배포

GitHub Actions 워크플로는 [`/Users/gribbon_choi/mock-admin/.github/workflows/deploy.yml`](/Users/gribbon_choi/mock-admin/.github/workflows/deploy.yml) 에 있습니다.

- 트리거
  - `main` 브랜치 push
  - 수동 실행 (`workflow_dispatch`)
- 동작
  - `yarn install --immutable`
  - `yarn build`
  - S3 업로드
  - CloudFront 캐시 무효화

### GitHub 설정값

Repository `Variables`

- 없음

Repository `Secrets`

- 없음

현재 워크플로에 반영된 배포 대상

- S3: `s3://mock-admin-front-dev`
- CloudFront Distribution ID: `E3V31IFVJZ8NY1`
- Region: `ap-northeast-2`
- VITE_API_URL: `https://agent-api.green-ribbon.co.kr`
- Role ARN: `arn:aws:iam::938617530895:role/github-action-role`

### 권장 AWS 설정

- GitHub Actions OIDC 신뢰 정책이 연결된 IAM Role 사용
- Role에 S3 Put/Delete, CloudFront Invalidation 권한 포함
