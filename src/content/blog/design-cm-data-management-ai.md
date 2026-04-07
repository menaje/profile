---
title: "설계와 CM에서 데이터 관리와 AI를 어떻게 활용해볼까"
description: "설계, 입찰, CM 실행에서 실제로 제안 가능한 시스템은 무엇이고, 이를 가능하게 하는 공통 데이터 기반은 무엇인지 정리합니다."
publishedDate: 2026-03-23
updatedDate: 2026-04-07
draft: false
tags: []
ogImage: "/blog/obsidian-graph-full.png"
---

## 시작하며

설계와 CM에서 AI를 활용하자는 이야기는 이제 낯설지 않습니다. 다만 실제 현장에서는 여전히 한 가지 질문이 남습니다.

> AI를 어디에 붙여야 정말 도움이 될까

이 질문은 자연스럽지만, 그대로 두면 쉽게 기능 배치의 문제로만 좁아집니다. 기존에 정리한 의견 문서들을 다시 보면 더 먼저 물어야 할 것은 따로 있습니다. `AI는 어느 화면에 붙일 것인가`보다 `AI가 실무에서 성능을 내려면 어떤 데이터 구조가 먼저 있어야 하는가`가 더 중요한 질문입니다.

제 생각은 분명합니다. 먼저 해야 할 일은 AI 기능을 붙이는 것이 아니라, 설계와 CM 사이에서 끊기는 데이터를 어떻게 관리할 것인지부터 정리하는 것입니다. 데이터가 연결되지 않으면 AI는 그럴듯한 답변을 할 수는 있어도, 실무에서 믿고 쓸 만한 결과를 내기 어렵습니다.

그래서 이 글에서는 설계와 CM 실무에서 데이터 관리가 왜 먼저인지, PMIS만으로는 왜 부족한지, 그리고 실제로는 어떤 부서 시스템과 공통 기반으로 이 문제를 풀 수 있는지 정리해 보려 합니다.

<div class="blog-visual blog-visual--summary">
  <div class="blog-visual__intro">
    <span class="site-badge site-badge--primary">핵심 요약</span>
    <h3 class="blog-visual__title">AI보다 먼저 정리해야 할 것은 데이터의 연결 구조입니다.</h3>
    <p class="blog-visual__lead">설계와 CM에서는 프로젝트 데이터의 연속성, 회사 차원의 데이터 전이, 권한 기반 AI 접근 계층이 함께 설계되어야 합니다.</p>
  </div>
  <div class="blog-chip-row" aria-label="핵심 요소">
    <span class="site-badge site-badge--neutral">프로젝트 맥락 연결</span>
    <span class="site-badge site-badge--neutral">회사 차원 재사용</span>
    <span class="site-badge site-badge--neutral">보안 통제형 AI</span>
  </div>
</div>

## 설계와 CM에서는 왜 같은 문제가 반복될까

건축 프로젝트는 하나인데, 실제 업무는 설계, CM, 입찰, 실행, 유지관리처럼 나뉘어 돌아갑니다. 이 구조 자체는 자연스럽습니다. 문제는 프로젝트가 단계와 부서를 넘어갈 때 데이터와 맥락이 함께 이어지지 않는다는 데 있습니다.

이 문제는 생각보다 여러 장면에서 드러납니다.

- 설계단계 VE인데도 기능 중심 제안보다 시공 디테일 중심 의견이 반복되는 경우
- 계약 단계에서 오간 중요한 약속이 실행 단계로 제대로 넘어오지 않는 경우
- 최근 바뀐 법령이나 제출 기준을 실무자가 뒤늦게 알아 급하게 대응하는 경우

이 세 장면은 서로 달라 보이지만 공통점이 있습니다. 문서는 있었지만 판단의 배경이 없었고, 결과물은 있었지만 왜 그렇게 되었는지가 남아 있지 않았으며, 외부 기준은 바뀌었는데 내부 운영 데이터는 그것을 따라가지 못했다는 점입니다.

결국 실무자는 매번 원문을 다시 읽고, 관계를 다시 추적하고, 맥락을 다시 재구성해야 합니다. 같은 프로젝트인데도 매 단계에서 다시 이해해야 하는 구조가 만들어지는 것입니다.

<div class="blog-visual">
  <div class="blog-visual__intro">
    <span class="site-badge site-badge--accent">문제 장면</span>
    <h3 class="blog-visual__title">실무에서 반복되는 데이터 단절은 보통 이런 형태로 나타납니다.</h3>
  </div>
  <div class="blog-issue-grid">
    <article class="site-card blog-issue-card">
      <span class="site-badge site-badge--domain-construction">설계 VE</span>
      <h4 class="blog-issue-card__title">기능보다 디테일 제안이 반복됨</h4>
      <p class="blog-issue-card__summary">설계의도와 대안 검토 이력이 공유되지 않으면 VE가 기능 검토보다 시공 디테일 중심으로 좁아집니다.</p>
    </article>
    <article class="site-card blog-issue-card">
      <span class="site-badge site-badge--secondary">계약 인수인계</span>
      <h4 class="blog-issue-card__title">계약서 밖의 약속이 누락됨</h4>
      <p class="blog-issue-card__summary">영업 단계의 맥락과 예외 조건이 실행 단계로 이어지지 않으면 실무자가 뒤늦게 책임 범위를 다시 해석하게 됩니다.</p>
    </article>
    <article class="site-card blog-issue-card">
      <span class="site-badge site-badge--primary">외부 기준</span>
      <h4 class="blog-issue-card__title">법령 변화가 내부 운영에 늦게 반영됨</h4>
      <p class="blog-issue-card__summary">제출 기준과 체크리스트가 외부 개정 정보와 연결되지 않으면 문제는 항상 마감 직전에 드러납니다.</p>
    </article>
  </div>
</div>

## PMIS만으로는 왜 부족할까

많은 조직에서 PMIS는 프로젝트 단위 관리에 잘 맞는 도구입니다. 일정, 문서, 공정, 이슈, 승인 흐름을 관리하는 데 분명한 역할이 있습니다. 하지만 여기에는 구조적인 한계가 있습니다.

PMIS는 대개 프로젝트를 단위로 데이터를 관리합니다. 그래서 한 프로젝트 안에서는 정보가 모일 수 있어도, 회사 차원에서 보면 데이터가 각 프로젝트 안에 고립되기 쉽습니다.

이 구조에서는 다음이 어려워집니다.

- 타 프로젝트에서 비슷한 이슈를 어떻게 해결했는지 참고하기
- 다른 부서가 어떤 기준으로 판단했는지 재사용하기
- 반복되는 누락 패턴이나 변경 패턴을 회사 차원에서 분석하기
- 법령 변화나 제출 기준 변화를 공통 기준으로 빠르게 반영하기

즉, 프로젝트는 관리되지만 회사는 학습하지 못하는 상태가 됩니다. 그래서 필요한 것은 PMIS를 없애는 것이 아니라, PMIS 위에 회사 차원의 데이터 전이 구조를 추가하는 것입니다.

<div class="blog-compare-grid" aria-label="PMIS 비교">
  <article class="site-card blog-compare-card">
    <p class="blog-compare-card__eyebrow">PMIS만 있을 때</p>
    <h3 class="blog-compare-card__title">프로젝트는 관리되지만 데이터는 고립되기 쉽습니다.</h3>
    <ul class="blog-compare-card__list">
      <li>프로젝트 안의 문서와 이슈는 관리됨</li>
      <li>타 프로젝트 사례 재사용이 어려움</li>
      <li>부서 간 판단 기준이 연결되지 않음</li>
      <li>AI도 각 프로젝트 범위 안에서만 부분 최적화됨</li>
    </ul>
  </article>
  <article class="site-card blog-compare-card blog-compare-card--focus">
    <p class="blog-compare-card__eyebrow">PMIS + 데이터 전이 구조</p>
    <h3 class="blog-compare-card__title">프로젝트 관리와 회사 차원 학습을 함께 가져갑니다.</h3>
    <ul class="blog-compare-card__list">
      <li>원문은 프로젝트 단위로 유지</li>
      <li>재사용 가능한 사실과 관계는 공통 레이어로 전이</li>
      <li>타 프로젝트와 타 부서 경험을 현재 업무에 연결</li>
      <li>AI가 더 넓은 맥락을 근거와 함께 설명 가능</li>
    </ul>
  </article>
</div>

## 그러면 무엇을 관리해야 할까

데이터 관리라고 하면 문서를 잘 모아 두는 것을 먼저 떠올리기 쉽습니다. 하지만 설계와 CM에서 중요한 것은 문서 자체보다도 그 문서가 어떤 맥락에서 만들어졌는지입니다.

제가 보기에 최소한 다음은 함께 관리되어야 합니다.

- 문서와 버전
- 회의와 결정
- 변경 요청과 승인
- 이슈와 미결 사항
- 인수인계 패키지
- 법령, 지침, 제출 기준 같은 외부 기준
- 정제된 사실과 관계를 원문에 다시 연결해 주는 출처 정보

핵심은 파일 저장소를 만드는 것이 아니라, 프로젝트의 맥락 저장소를 만드는 것입니다. 문서만 있으면 사람은 다시 해석해야 하지만, 관계와 이력이 남아 있으면 시스템이 맥락을 이어 줄 수 있습니다.

## 회사 차원에서는 데이터 전이가 필요하다

여기서 말하는 데이터 전이는 모든 원문을 한곳에 몰아넣는다는 뜻이 아닙니다. 원문은 원래 시스템과 문서에 그대로 두고, 그중 재사용 가치가 있는 사실, 관계, 메타데이터를 추출하고 정제해 회사 차원의 공통 지식 레이어로 옮기는 것을 뜻합니다.

예를 들면 이런 것들입니다.

- 어떤 유형의 프로젝트에서 어떤 변경 이슈가 반복되는지
- 설계에서 CM으로 넘어갈 때 무엇이 자주 누락되는지
- 특정 발주처 유형에서 어떤 요구사항이 반복되는지
- 최근 법령 개정이 어떤 프로젝트에 영향을 주는지
- VE에서 어떤 기능 검토 포인트가 자주 등장하는지

이런 데이터가 쌓이면 회사는 각 프로젝트를 따로 관리하는 수준을 넘어서, 프로젝트를 통해 학습하는 조직으로 바뀔 수 있습니다.

<div class="blog-flow" aria-label="데이터 전이 구조">
  <article class="site-card blog-flow-card">
    <span class="site-badge site-badge--neutral">1. 원천 데이터</span>
    <h3 class="blog-flow-card__title">PMIS, 문서, 회의록, 계약, 법령</h3>
    <p class="blog-flow-card__text">실제 업무의 원문과 원본 시스템은 그대로 소스 오브 트루스로 유지합니다.</p>
  </article>
  <div class="blog-flow__arrow" aria-hidden="true">&rarr;</div>
  <article class="site-card blog-flow-card">
    <span class="site-badge site-badge--secondary">2. 정제와 전이</span>
    <h3 class="blog-flow-card__title">사실, 관계, 메타데이터 추출</h3>
    <p class="blog-flow-card__text">재사용 가능한 판단 근거와 패턴만 구조화해 회사 차원의 공통 레이어로 전이합니다.</p>
  </article>
  <div class="blog-flow__arrow" aria-hidden="true">&rarr;</div>
  <article class="site-card blog-flow-card">
    <span class="site-badge site-badge--primary">3. AI 접근 계층</span>
    <h3 class="blog-flow-card__title">수집, 대조, 필터링, 설명</h3>
    <p class="blog-flow-card__text">AI는 원천 데이터와 정제 데이터를 함께 읽고 사용자 권한에 맞는 정보만 제공합니다.</p>
  </article>
  <div class="blog-flow__arrow" aria-hidden="true">&rarr;</div>
  <article class="site-card blog-flow-card">
    <span class="site-badge site-badge--accent">4. 사람의 활용</span>
    <h3 class="blog-flow-card__title">브리핑, 비교, 경고, 추천</h3>
    <p class="blog-flow-card__text">실무자는 원문 전체 대신 지금 필요한 맥락과 근거 위치부터 빠르게 확인합니다.</p>
  </article>
</div>

## AI는 어디에 붙여야 할까

이 질문은 실무적으로는 유효하지만, 전략적으로는 한 번 더 바꿔서 보는 편이 맞습니다. 핵심은 `AI를 어디에 붙일까`가 아니라 `무엇이 AI 퍼포먼스를 좌우하는가`입니다.

기존 의견서에서 반복해서 말한 것도 같은 내용입니다. AI의 퍼포먼스는 모델 크기나 문장력만으로 결정되지 않습니다. 어떤 데이터를 읽을 수 있는지, 그 데이터가 어떤 관계로 연결되어 있는지, 누가 어떤 이유로 판단했는지, 그리고 그 정보가 지금도 유효한지가 먼저 정리되어 있어야 합니다.

따라서 설계와 CM에서 AI를 붙이는 위치는 개별 화면의 부가 기능이라기보다, `원천 데이터와 사람 사이에서 맥락을 해석하는 중간 접근 계층`이라고 보는 편이 맞습니다. 다시 말해, 성능을 바꾸는 것은 모델 업그레이드만이 아니라 데이터 연속성과 데이터 전이 구조입니다.

이 관점에서 AI는 다음과 같이 동작해야 합니다.

- 원천 데이터와 정제 데이터를 함께 읽는다.
- 현재 프로젝트의 맥락과 회사 차원의 경험을 함께 대조한다.
- 사용자 권한에 맞는 정보만 필터링해 전달한다.
- 답변마다 근거, 시점, 출처를 남긴다.
- 단순 요약을 넘어서 다음 행동으로 이어지게 만든다.

그래서 사람에게 원문 전체를 그대로 보여 주는 방식으로 가면 안 됩니다. 보안과 활용성을 동시에 가져가려면, AI가 중간에서 필요한 데이터만 수집하고 사람에게는 허용된 수준의 사실, 관계, 요약을 우선 제공하는 구조가 필요합니다. 좋은 AI 활용은 더 많이 보여 주는 데서 나오지 않고, 필요한 만큼 정확하게 보여 주는 구조에서 나옵니다.

퍼포먼스가 높아진다는 것도 같은 의미입니다. 답변이 더 길어지거나 더 자연스러워지는 것이 아니라, 필요한 순간에 필요한 맥락을 정확히 찾아와서 근거와 함께 다음 행동으로 이어지게 만드는 능력이 높아지는 것입니다. 결국 `AI를 붙이는 위치`는 화면이 아니라 데이터 흐름과 의사결정 흐름 사이입니다.

<div class="blog-filter-grid" aria-label="AI 퍼포먼스 관점">
  <article class="site-card blog-filter-card">
    <span class="site-badge site-badge--primary">AI 퍼포먼스를 좌우하는 것</span>
    <ul class="blog-filter-card__list">
      <li>프로젝트 맥락이 연결되어 있는가</li>
      <li>원천 데이터와 정제 데이터가 함께 읽히는가</li>
      <li>타 프로젝트와 타 부서 경험이 전이되는가</li>
      <li>권한과 출처가 함께 관리되는가</li>
    </ul>
  </article>
  <article class="site-card blog-filter-card">
    <span class="site-badge site-badge--neutral">이 기반 위에서 AI가 하는 일</span>
    <ul class="blog-filter-card__list">
      <li>인수인계 브리핑과 쟁점 요약</li>
      <li>관련 문서와 결정 흐름 연결</li>
      <li>누락된 승인과 근거 탐지</li>
      <li>유사 사례와 외부 기준 대조</li>
    </ul>
  </article>
</div>

## 업무 유형에 따라 AI 정책은 달라진다

여기서 한 가지를 더 분명히 해 둘 필요가 있습니다. 모든 업무에 같은 방식의 AI 정책을 적용하는 것은 맞지 않습니다. 그리고 아래 구분은 이론적인 분류라기보다, 제가 실제 업무를 하면서 체감한 경험적 판단에 가깝습니다. 제안서 작성과 CM 실행 업무를 직접 겪어 보니, 무엇이 성능을 좌우하는지가 서로 다르게 느껴졌습니다.

제안서 작성 업무는 제 경험상 `퍼포먼스 중심 AI 정책`에 더 가깝습니다. 이 업무는 기본적으로 발주처가 제공한 자료를 중심으로 돌아가고, 회사 내부 데이터는 실적, 인력, 유사 사례처럼 보강 자료로 붙는 경우가 많습니다. 그래서 중요한 것은 대규모 운영 데이터의 축적보다도 요구사항을 얼마나 빠르게 구조화하는지, 회사 자료를 얼마나 적절히 엮는지, 그리고 짧은 시간 안에 완성도 높은 초안을 얼마나 안정적으로 만드는지입니다.

반대로 CM 현장 업무는 제 경험상 `데이터 중심 AI 정책`에 더 가깝습니다. 현장에서는 처음부터 좋은 문장을 생성하는 것보다, 현장에서 발생하는 이슈와 판단, 변경, 승인, 관련 문서가 계속 데이터로 남고 연결되는지가 더 중요합니다. 그래야 특정 문제가 생겼을 때 관련 데이터를 다시 취합해 공문, 기술검토서, 브리핑 형태로 문서화할 수 있습니다. 여기서는 AI의 문장력보다 `근거 데이터가 축적되고 연결되어 있는가`가 성능을 더 크게 좌우합니다.

설계업무는 조금 다르게 봐야 합니다. 이 부분은 제가 직접 충분히 검증한 경험이라기보다, 설계업무의 특성과 현재 AI 기술 수준을 놓고 볼 때 그렇게 전개될 가능성이 높다고 판단하는 영역입니다. CM의 경험과 반복 이슈를 설계 검토에 반영하는 단계는 데이터 중심 성격이 강할 것으로 보입니다. 반면 실제 설계도면 생성이나 대안 자동화까지 AI가 수행하려면, 설계 기준과 제약조건을 반영할 수 있는 높은 수준의 생성 성능과 제어 가능성이 전제되어야 하므로 퍼포먼스 중심 성격도 강할 것으로 보입니다.

정리하면 이렇게 볼 수 있습니다.

- 제안서 작성: 직접 경험상 퍼포먼스 중심 AI 정책이 더 중요함
- CM 실행: 직접 경험상 데이터 중심 AI 정책이 더 중요함
- 설계: 직접 검증보다는 추정에 가까우며, 검토 단계는 데이터 중심, 생성 단계는 퍼포먼스 중심 성격이 강할 가능성이 큼

<div class="blog-policy-grid" aria-label="업무 유형별 AI 정책">
  <article class="site-card blog-policy-card blog-policy-card--performance">
    <span class="site-badge site-badge--secondary">경험 기반 · 퍼포먼스 중심</span>
    <h3 class="blog-policy-card__title">제안서 작성</h3>
    <p class="blog-policy-card__summary">발주처 자료를 빠르게 읽고 구조화한 뒤, 회사 데이터를 적절히 덧대어 짧은 시간 안에 높은 완성도의 결과물을 만드는 쪽에 무게가 실립니다.</p>
    <ul class="blog-policy-card__list">
      <li>핵심 입력: 발주처 제공 자료</li>
      <li>보강 데이터: 실적, 인력, 유사 사례</li>
      <li>중요 성능: 요구사항 해석, 초안 완성도, 수정 대응 속도</li>
    </ul>
  </article>
  <article class="site-card blog-policy-card blog-policy-card--data">
    <span class="site-badge site-badge--domain-construction">경험 기반 · 데이터 중심</span>
    <h3 class="blog-policy-card__title">CM 실행</h3>
    <p class="blog-policy-card__summary">현장 이슈와 판단, 변경, 승인, 관련 문서가 계속 데이터로 남고 연결되어야 특정 상황에서 근거를 다시 취합해 실무 문서로 재구성할 수 있습니다.</p>
    <ul class="blog-policy-card__list">
      <li>핵심 입력: 현장 문서와 발생 이슈</li>
      <li>보강 데이터: 승인 흐름, 변경 이력, 관련 근거</li>
      <li>중요 성능: 추적성, 재구성 가능성, 근거 기반 문서화</li>
    </ul>
  </article>
  <article class="site-card blog-policy-card blog-policy-card--hybrid">
    <span class="site-badge site-badge--primary">혼합형 · 추정 영역</span>
    <h3 class="blog-policy-card__title">설계</h3>
    <p class="blog-policy-card__summary">설계 검토와 환류는 데이터 중심으로 접근할 가능성이 크고, 실제 도면 생성과 대안 자동화는 높은 생성 성능과 제어 가능성을 전제로 발전할 가능성이 큽니다.</p>
    <ul class="blog-policy-card__list">
      <li>검토 단계: CM 경험과 반복 이슈의 환류</li>
      <li>생성 단계: 도면 생성과 대안 자동화</li>
      <li>중요 성능: 데이터 반영 능력과 생성 퍼포먼스의 결합</li>
    </ul>
  </article>
</div>

## 실제로는 어떤 시스템을 제안할 수 있을까

문제를 이해하는 것과 실제 제안 가능한 프로젝트를 말하는 것은 다릅니다. 조직에 제안하려면 "AI를 잘 써보자"가 아니라 "어느 부서에 어떤 시스템을 제안할 것인가"까지 말할 수 있어야 합니다.

여기서 제안서 작성과 CM 실행에 대한 관점은 실제 경험에서 나온 판단이고, 설계에 대한 관점은 업무 특성과 기술 흐름을 바탕으로 한 추정이라는 점을 전제로 두는 편이 맞습니다. PQ는 시스템 제안 범위에는 포함될 수 있지만, 위의 퍼포먼스 중심 판단 자체는 제안서 작성 경험을 중심으로 정리한 것입니다.

<div class="blog-evidence-grid" aria-label="판단 근거 구분">
  <article class="site-card blog-evidence-card">
    <span class="site-badge site-badge--neutral">직접 경험 기반</span>
    <h3 class="blog-evidence-card__title">제안서 작성 / CM 실행</h3>
    <p class="blog-evidence-card__text">업무 중 실제로 겪은 자료 해석, 인수인계, 현장 문서화, 기준 변화 대응 경험을 바탕으로 정책 방향을 판단한 영역입니다.</p>
  </article>
  <article class="site-card blog-evidence-card blog-evidence-card--accent">
    <span class="site-badge site-badge--accent">업무 특성 기반 추정</span>
    <h3 class="blog-evidence-card__title">설계</h3>
    <p class="blog-evidence-card__text">설계 검토와 도면 생성이 요구하는 성격, 그리고 현재 AI 기술 수준을 함께 놓고 볼 때 예상되는 발전 방향을 정리한 영역입니다.</p>
  </article>
</div>

제가 보기에는 다음 네 가지가 가장 현실적인 부서별 시스템입니다.

<div class="blog-system-grid" aria-label="부서별 시스템">
  <article class="site-card blog-system-card">
    <span class="site-badge site-badge--secondary">영업 · 입찰 · PQ · 제안</span>
    <h3 class="blog-system-card__title">기회 발굴과 PQ/제안 진입 자동화</h3>
    <p class="blog-system-card__summary">발주처 자료를 중심으로 AI가 요구사항을 빠르게 구조화하고, 회사 데이터를 보강해 제안서 작성을 지원하며, 같은 구조를 PQ까지 확장 적용할 수 있는 시스템입니다.</p>
    <ul class="blog-system-card__list">
      <li>입찰 후보 수집과 기본 분류</li>
      <li>회사 적합도 1차 평가</li>
      <li>PQ 체크리스트와 제안 요구사항 추출</li>
      <li>선정 프로젝트의 워크스페이스 자동 진입</li>
    </ul>
  </article>
  <article class="site-card blog-system-card">
    <span class="site-badge site-badge--domain-construction">CM 실행</span>
    <h3 class="blog-system-card__title">문서 지능화와 공문/기술검토 초안 작성</h3>
    <p class="blog-system-card__summary">현장 문서를 분류하고 이슈, 변경, 승인 데이터를 계속 축적한 뒤 필요 시 관련 근거를 다시 취합해 문서화하는 데이터 중심 성격의 구조입니다.</p>
    <ul class="blog-system-card__list">
      <li>문서 자동 분류와 메타데이터 추출</li>
      <li>이슈, 변경, 승인, 미결 사항 연결</li>
      <li>공문, 기술검토서 초안 작성</li>
      <li>누락 근거와 승인 탐지</li>
    </ul>
  </article>
  <article class="site-card blog-system-card">
    <span class="site-badge site-badge--primary">설계</span>
    <h3 class="blog-system-card__title">CM 경험의 설계 환류 시스템</h3>
    <p class="blog-system-card__summary">이 영역은 현재로서는 추정에 기반한 제안에 가깝습니다. 설계 검토와 환류는 데이터 중심으로, 실제 도면 생성과 대안 자동화는 높은 AI 퍼포먼스를 전제로 발전할 가능성이 있는 구조입니다.</p>
    <ul class="blog-system-card__list">
      <li>반복 시공 이슈 라이브러리</li>
      <li>설계 검토 체크리스트 추천</li>
      <li>유사 프로젝트 기반 개선 포인트 제안</li>
      <li>CM 기술검토 결과의 설계 반영</li>
    </ul>
  </article>
  <article class="site-card blog-system-card">
    <span class="site-badge site-badge--neutral">경영 · PMO</span>
    <h3 class="blog-system-card__title">프로젝트 상태 브리핑 시스템</h3>
    <p class="blog-system-card__summary">실무 문서를 모두 읽지 않아도 프로젝트 상태, 리스크, 병목, 인수인계 누락 가능성을 빠르게 파악할 수 있게 하는 보조 시스템입니다.</p>
    <ul class="blog-system-card__list">
      <li>핵심 리스크와 미결 이슈 요약</li>
      <li>일정, 변경, 승인 병목 구간 브리핑</li>
      <li>부서별 쟁점 비교</li>
      <li>프로젝트 간 상황 비교</li>
    </ul>
  </article>
</div>

이 네 시스템은 따로 보일 수 있지만, 사실은 하나의 공통 데이터 구조 위에서 역할별로 다른 인터페이스를 갖는 형태로 보는 것이 맞습니다.

## 공통으로 설계되어야 할 기반은 무엇일까

부서별 시스템만 따로 도입하면 각 부서에서만 부분 최적화가 일어날 수 있습니다. 그래서 반드시 공통사항을 함께 설계해야 합니다. 제가 보기에는 다음 다섯 가지가 공통 백본입니다.

<div class="blog-common-grid" aria-label="공통 기반">
  <article class="site-card blog-common-card">
    <span class="site-badge site-badge--neutral">공통 데이터 모델</span>
    <p class="blog-common-card__text">프로젝트, 단계, 문서, 회의, 결정, 변경, 승인, 이슈, 인수인계 패키지 같은 공통 객체가 먼저 정의되어야 합니다.</p>
  </article>
  <article class="site-card blog-common-card">
    <span class="site-badge site-badge--secondary">데이터 전이와 정제</span>
    <p class="blog-common-card__text">프로젝트별 원천 데이터에서 재사용 가능한 사실과 관계를 추출하고, 회사 차원의 공통 레이어로 전이해야 합니다.</p>
  </article>
  <article class="site-card blog-common-card">
    <span class="site-badge site-badge--primary">권한 기반 AI 접근</span>
    <p class="blog-common-card__text">AI는 원문을 무차별 노출하는 도구가 아니라, 권한과 보안 기준에 맞게 정보를 필터링해 전달하는 접근 계층이어야 합니다.</p>
  </article>
  <article class="site-card blog-common-card">
    <span class="site-badge site-badge--accent">공통 분류 체계</span>
    <p class="blog-common-card__text">문서 유형, 이슈 유형, 변경 유형, 프로젝트 유형, 보안 등급 같은 메타데이터 기준이 있어야 검색과 비교, 추천이 가능합니다.</p>
  </article>
  <article class="site-card blog-common-card">
    <span class="site-badge site-badge--neutral">출처와 감사 로그</span>
    <p class="blog-common-card__text">AI 응답과 문서 초안이 어떤 근거에서 나왔는지 되짚을 수 있어야 하고, 누가 무엇을 조회하고 생성했는지도 남아야 합니다.</p>
  </article>
</div>

이 공통 기반이 없으면 입찰 부서의 시스템은 입찰 부서 안에서만 끝나고, CM 실행 시스템은 현장 안에서만 끝납니다. 반대로 공통 기반이 있으면 각 부서의 경험이 회사의 경험으로 축적될 수 있습니다.

## 마치며

설계와 CM에서 AI를 잘 쓰고 싶다면, 먼저 데이터 관리의 기준을 다시 세워야 합니다. 핵심은 새 PMIS를 하나 더 만드는 것이 아니라, 부서별 시스템을 공통 데이터 기반 위에 올리고, 프로젝트에서 생성된 경험을 회사 차원의 자산으로 전이하는 것입니다.

그 위에서 AI는 비로소 실무적인 가치를 만들 수 있습니다. 다만 그 가치가 만들어지는 방식은 업무마다 다릅니다. 제안서 작성은 제 경험상 퍼포먼스 중심으로, CM 실행은 제 경험상 데이터 중심으로 보는 편이 더 현실적이고, 설계는 환류 단계에서는 데이터 중심으로, 실제 생성 단계에서는 높은 AI 퍼포먼스를 전제로 보는 편이 맞습니다. 하지만 이 모든 것은 공통 데이터 모델과 데이터 전이 구조가 있을 때만 가능합니다.

한 문장으로 정리하면 이렇습니다.

> 부서는 각자의 시스템을 쓰되, 회사의 경험은 공통 데이터 기반 위에서 이어지고 AI는 그 연결을 안전하게 돕는 구조여야 한다.
