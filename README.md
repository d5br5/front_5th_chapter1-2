## 과제 체크포인트
### 배포 링크

- main: https://d5br5.github.io/front_5th_chapter1-2
- hash: https://d5br5.github.io/front_5th_chapter1-2/index.hash.html

<details>
<summary>기본과제</summary>

#### 가상돔을 기반으로 렌더링하기

- [x] createVNode 함수를 이용하여 vNode를 만든다.
- [x] normalizeVNode 함수를 이용하여 vNode를 정규화한다.
- [x] createElement 함수를 이용하여 vNode를 실제 DOM으로 만든다.
- [x] 결과적으로, JSX를 실제 DOM으로 변환할 수 있도록 만들었다.

#### 이벤트 위임

- [x] 노드를 생성할 때 이벤트를 직접 등록하는게 아니라 이벤트 위임 방식으로 등록해야 한다
- [x] 동적으로 추가된 요소에도 이벤트가 정상적으로 작동해야 한다
- [x] 이벤트 핸들러가 제거되면 더 이상 호출되지 않아야 한다

</details>

<details>
<summary>심화과제</summary>

#### 1) Diff 알고리즘 구현

- [x] 초기 렌더링이 올바르게 수행되어야 한다
- [x] diff 알고리즘을 통해 변경된 부분만 업데이트해야 한다
- [x] 새로운 요소를 추가하고 불필요한 요소를 제거해야 한다
- [x] 요소의 속성만 변경되었을 때 요소를 재사용해야 한다
- [x] 요소의 타입이 변경되었을 때 새로운 요소를 생성해야 한다

#### 2) 포스트 추가/좋아요 기능 구현

- [x] 비사용자는 포스트 작성 폼이 보이지 않는다
- [x] 비사용자는 포스트에 좋아요를 클릭할 경우, 경고 메세지가 발생한다.
- [x] 사용자는 포스트 작성 폼이 보인다.
- [x] 사용자는 포스트를 추가할 수 있다.
- [x] 사용자는 포스트에 좋아요를 클릭할 경우, 좋아요가 토글된다.

</details>

## 과제 셀프회고

- 가상 DOM은 성능을 향상시켜주지는 않는다는 사실에 살짝 충격을 받았다.
- 어렴풋하게 알고 있던 내용을 직접 구현해볼 수 있어 좋았다. 
  - 정리된 자료를 보기만 했을 때는 슥 보고 지나가서 머릿속에 오래 남지 못했는데, 직접 구현해보니 오래 기억할 수 있을 것 같다.
  - diff 알고리즘을 간단하게나마 구현해봤다. 물론 실제 react는 더 복잡한 처리를 하고 있겠지.. 찾아봐야겠다.
  - transfile 과정
    - 리액트 개발자라면 숨쉬듯 사용하던 jsx.. 너무나 자연스럽게 사용하고 있었는데 정작 그 변환과정은 몰랐다.
    - 본 과제에는 `<></>`  이 프래그먼트 처리가 없는 것 같다. 그래서 추가로 구현해봤다. 
- 과제가 스텝별로 잘 구분되어 있어, 생각의 흐름을 발전시키고 구분하기 수월했다.
  - 테스트 코드가 잘 그룹화되어있어, 편했다.
    - 근데 코드에 결함이 있어도 테스트가 통과하는 경우가 있었다.
    - 그 결함은 다른 테스트 코드에서 실패로 나타나게 되는데, 디버깅하다 보면 테스트 성공했던 코드에 결함이 있었음을 알게 되는 경우가 종종 있었다.

### eventManager 구현 및  리팩토링

#### event manager ver.1

```jsx
const eventMap = new Map();

export function setupEventListeners(root) {
  for (const [eventType, handlers] of eventMap.entries()) {
    handlers.forEach(({ element, handler }) => {
      if (element && root.contains(element)) {
        root.addEventListener(eventType, handler);
      }
    });
  }
}

export function addEvent(element, eventType, handler) {
  if (!eventMap.has(eventType)) {
    eventMap.set(eventType, []);
  }
  eventMap.get(eventType).push({ element, handler });
}

export function removeEvent(element, eventType, handler) {
  if (eventMap.has(eventType)) {
    const handlers = eventMap.get(eventType);
    const index = handlers.findIndex(
      (h) => h.element === element && h.handler === handler,
    );
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }
}
```

- 구조
    - eventMap: Map[ key, [ { elem, handler } ] ]
    - addEvent: Map.get(key) 에 대응하는 배열에 {elem, handler} 원소 추가
    - removeEvent: 위 배열에서 {elem, handler} 를 직접 찾아서 제거
    - setupEventListeners: 이 함수가 호출되는 순간에, eventMap 에 저장된 핸들러들을 root에 부착
- 문제점
  - removeEvent 호출시, eventMap에서 elem, handler를 제거해도 root 에 반영되지 않는다.
  - ![image](https://github.com/user-attachments/assets/31ef4a1a-92a3-427e-90be-f7adb0c096d7)
- 개선 방안
    - root가 eventMap을 참조하는 타이밍을, root에 이벤트 핸들러를 부착하는 순간이 아니라, 부착된 이벤트 핸들러가 호출되는(이벤트가 발생한) 순간이 되도록 변경한다.

#### event manager ver.2

```jsx
export function setupEventListeners(root) {
  for (const [eventType, typeEvents] of eventTypeMap) {
    root.addEventListener(eventType, (event) => {
      const target = event.target;
      if (typeEvents.has(target)) {
        const handler = typeEvents.get(target);
        handler(event);
      }
    });
  }
}
```

- 구조
    - 이벤트가 발생한 순간에 eventMap을 순회하여, 실행해야 하는 핸들러들 모두 실행한다.
        - 제거된 핸들러도 정상적으로 반영된 것을 확인할 수 있다.
        - ![image (1)](https://github.com/user-attachments/assets/cf9d9f2c-111a-40cd-9d66-9a0a044c540c)
    - Map이나 Set 등의 자료구조를 활용하도록 개선했다.
        - 배열 자료구조는 넣고 빼는 과정에서, 메서드 조작이 직관적이지 않아 휴먼에러가 발생할 수 있다.

- 문제점
    - renderElement 테스트를 통과하지 못한다..
      - ![image (2)](https://github.com/user-attachments/assets/a16e7a2e-2960-494f-9d16-27a60202767f)
    - oh, why??
        - 디버깅해보니 new button에 등록한 핸들러가 2번 호출되고 있었다.
        - new button은 ‘한 번’ 추가되었기 때문에, new button의 이벤트가 두번 등록된 것은 아니다.
        - **‘root에 event 발생했을 때 eventMap을 순회하여 각 핸들러를 수행해라’** 라는 핸들러가 2번 등록된 것이다.

#### event manager ver.3

```jsx
// 등록해둔 이벤트 타입을 Map[root, Set[eventType]] 으로 관리
const rootEventMap = new Map();
const eventTypeMap = new Map();

export function setupEventListeners(root) {

  // root에 등록할 eventType 집합 초기화
  if (!rootEventMap.has(root)) {
    rootEventMap.set(root, new Set());
  }

  // root에 연결되어 있는 이벤트 타입들
  const rootEvents = rootEventMap.get(root);

  eventTypeMap.forEach((typeEvents, eventType) => {
    // 이벤트 타입이 root에 등록되어 있다면 리턴
    if (rootEvents.has(eventType)) return;
	
   // 이벤트 타입을 root에 등록
    rootEvents.add(eventType);
  
    // 이벤트 타입이 root에 등록되어 있지 않다면 이벤트 리스너 등록
    // 'typeEvents를 순회해서, 실행해야 하는 핸들러 있으면 실행한다' 라는 이벤트를 부착
    root.addEventListener(eventType, (event) => {
      const target = event.target;
      // 이벤트가 발생한 target의 handler가 Map에 있다면 수행
      if (typeEvents.has(target)) {
        const handler = typeEvents.get(target);
        handler(event);
      }
    });
  });
}
```

- 구조
    - rootEventMap: root에 등록한 event type 집합을 관리
    - **‘root에 event 발생했을 때 eventMap을 순회하여 각 핸들러를 수행해라’** 라는 핸들러를 event type 별로 한 번씩만 등록하기 위해서, 집합으로 관리
    - 해당 event type이 이미 등록되어 있다면 중복 등록하지 않는다.
- 문제
    - 여기까지 마치고 1-1 test를 다시 돌려봤더니,, 대참사가.. ㅜㅜ
    - 거의 뭐 아무것도 통과하지 못했다고 봐도 무방하다.
    - ![image (3)](https://github.com/user-attachments/assets/1b45d956-5695-4ea5-9b0f-a43d8cafc1bc)

- 해결
    - 에러 내역을 살펴보니 DOMException이 대부분이었다.
    - 중첩 구조(children)의 객체는 ‘재귀적’으로 정규화되어야 하는데, 함수형 노드일때에만 재귀가 동작하고 있었다.
    - 일반 중첩 객체 (사용자 정의 컴포넌트가 아닌 HTML)의 children들에게도 normalize를 재귀적으로 적용해주어야 한다. (이거 찾는데에만 4시간 넘게 소모한 듯.. )
    - 이거 하나 수정해줬더니, 1-1 테스트가 모두 성공했다!
    - ![image (4)](https://github.com/user-attachments/assets/3e4c2b5f-5728-45ea-8fba-4833cfcea2c3)        


### Fragment 처리

- 함수를 구현하다가, 문득 <></> Fragment 처리에 대해 궁금해졌다.
  - 현재 내가 작성하고, 테스트 완료한 코드에서는 이에 대한 처리가 없었기 때문이다. 
  - 트랜스파일러에서 자동으로 처리가 되는건가 싶어서 다음과 같은 태그들을 navigation 컴포넌트에  삽입해보았다.

```jsx
<>
  <div>test1</div>
  <div>test2</div>
</>
```

잘 나올 줄 알았는데, 페이지가 먹통이 되었다! 개발자 도구를 열어 어떻게 변환되었는지 열어보았다. 이런 에러가 뜬다.

![image (5)](https://github.com/user-attachments/assets/f2ae1757-c49b-428a-b946-b06c67396011)

엥 React..? 나는 리액트를 사용한적이 없는데..  소스 탭에서 컴포넌트가 어떻게 변환되었는지 찾아봤다

![image (6)](https://github.com/user-attachments/assets/82c8a6f3-2ffe-47f7-adda-6028c7e10150)

```jsx
createVNode(React.Fragment, null,
  createVNode("div", null, "test1"), 
  createVNode("div", null, "test2")
), 
```
- 위와 같이 변환되고 있었다. 
  - package.json을 보니 react-jsx 변환 babel plugin이 설치되어 있었다. 
  - 이것 때문인것으로 유추할 수 있겠다.
- 그래서 React.Fragment 말고 내가 직접 변환하기 위해 다음과 같이 처리해줬다. [커밋 : 662cb0e09cf209213823426221873ee16a1fbf46]
  1. vite.config.js 에 jsxFragment 옵션 설정  
    ```jsx
     defineConfig({
        esbuild: {
          jsxFactory: "createVNode",
          jsxFragment: "Fragment",
        },
        optimizeDeps: {
          esbuildOptions: {
            jsx: "transform",
            jsxFactory: "createVNode",
            jsxFragment: "Fragment",
          },
        },
      }),
    ```
    2. createVNode 파일 내부에 Fragment 변수 선언
    3. normalizeVNode 내부에서, vNode.type이 Fragment일때 처리
    4. 사용하고자 하는 jsx 파일 내부에서 Fragment 변수 import

- 이렇게 적용했더니, 잘 렌더링된다.
  - React의 Fragment가 아닌 내가 선언한 Fragment를 참조하고 있고,
  - 오류 없이 렌더링 잘 되고 있음을 확인할 수 있다. 얏호

![image (7)](https://github.com/user-attachments/assets/74597697-0899-440b-938d-438ef239cb8f)
![image (8)](https://github.com/user-attachments/assets/cfaf6ef1-2800-488d-b084-6e33673fbff9)

### 과제 피드백

- 테스트코드가 잘 그룹화되어 있어서 좋았습니다. 노션 과제 설명도 단계별로 잘 구분되어 있어, 따라가기만 해도 큰 구조를 그리는데에는 어려움이 없었습니다
- 코드에 결함이 있어도 테스트 코드를 통과하는 엣지 케이스가 있는 것 같습니다. 
  - 코드를 잘 짜면 -> 테케를 통과한다 는 맞지만 테케를 통과한다 -> 코드를 잘 짰다 는 아닐 수 있다는 것을 몸으로 배웠습니다
  - 그런 결함이 당장은 통과로 보이나 나중 가서 문제를 몰고 오는 경우가 저도 있었고, 주변 팀원분들도 많았던 것 같습니다.
  - 그래서 원점으로 회귀하게 되어 시간을 많이 소모하게 됐는데, 그런 엣지를 대비할 테스트 케이스가 좀 더 보완되면 잘못 나아가는 일이 조금은 줄어들지 않았을까 싶습니다!!
- diff알고리즘과 create, update element 로직을 직접 구현해볼 수 있어서 너무 많이 배워가는 과제였습니다 정말 감사합니다!!


## 리뷰 받고 싶은 내용

- nullish / boolean 걸러주는 작업을 createVNode에서도 하고, normalizeVNode에서도 해줬습니다. 구현을 다 하고 보니 뭔가 한 곳에서만 해줘도 될 것 같은데, 두 곳 모두에서 해주는 이유가 있나요? 테스트 코드도 그런 것을 의도하고 작성된 것 같아 질문 드립니다!
- 리액트에서는 구현되어 있는데, 본 과제에서는 다루지 않는 케이스가 또 있을까요? 예시로, Fragment가 있고 이거는 개인적으로 구현해 보았습니다. 너무 세부적인(?) 기능 말고 이렇게 큰 개념인데 안다룬 태그 혹은 개념이 있는지 알려주시면 감사하겠습니다. 따로 공부해보려구요. 
- 현재 setupEventListeners 에서 addEventListener 만 사용하고, removeEventListener는 사용하지 않았는데요. 여러 root에 대해 함수를 돌리다 보면 eventMap이 점점 커질수도 있을 것 같다는 생각이 듭니다. 어떤 방식 혹은 자료구조로 정리를 하면 더 좋을까요?
- 테스트 코드를 작성할때, 미처 생각하지 못했던 엣지 케이스를 어떻게 떠올릴 수 있을까요? 열심히 머릿속으로 시뮬레이션 돌려보는것 말고, 그런 부분을 찾는 기술적인 테크닉이 있을까요?

## 코치님 리뷰

수고하셨습니다! 과제를 아주 체계적으로 접근하셨고, 문제 해결 과정을 통해 깊은 이해를 얻으신 것 같네요. 특히 eventManager 구현 과정에서 버전별로 개선해나가는 과정이 인상적입니다.

"가상 DOM은 성능을 향상시켜주지는 않는다"라는 깨달음은 많은 개발자들이 잘못 이해하고 있는 부분인데 아주 좋습니다. 직접 구현을 하다보면 이게 더 빨라질수가 없는 인데 이론만 보면 DOM을 대신해서 VDOM이 더 빠른것처럼 느껴지게 되죠. 이론이 아닌 실제 구현을 통해서 공부를 해봐야 하는 이유이기도 합니다.

정확히 가상 DOM은 다소 성능을 희생하더라도 선언적 UI 프로그래밍 모델을 가능할게 할 수 있도록 개발편의성을 높이기 위한 전략적 아키텍쳐였죠. 

Fragment 처리를 추가로 구현해보신 부분도 훌륭합니다. 기본 요구사항을 넘어 추가적인 기능을 탐구하고 구현하신 점 아주 잘하셨습니다.

Q1)
nullish/boolean 필터링을 두 곳에서 하는 이유:

nullish/boolean은 DOM으로 출력할때에는 빈 스트링으로 출력하겠다라고 하는 것은 편의성을 위한 아키텍쳐적 정책이구요, createVNode와 normalizeVNode는 2개가 완전히 다른 책임을 가지고 있는데 같은 정책을 유지할 수 있도록 해당 기능을 2군데 모두 구현한것이라고 생각해주세요.

Q2)
과제에서 다루지 않은 React 기능들:

1) VDOM에서 배열을 다루게 되면 단순한 선형적 diff만으로는 최적화된 구조를 만들지 못하기에 key를 통해서 diff을 보장해주는 기능이 있습니다. key와 배열을 통한 기능을 만들어 보면 좋겠네요.

2) 이벤트 위임방식으로 DOM 이벤트를 사용하지 않다보니 DOM 이벤트의 특징인 캡쳐링과 버블링 또한 React 독자적으로 가지고 있습니다. 캡쳐링과 버블링도 한번 구현해보시면 좋겠네요.

3) useState, useMemo, useRef 등 컴포넌트의 상태를 유지하고 관리할 수 있는 기능들... 은 3주차 과제죠? 화이팅입니다.

4) 그밖에 try catch를 통해 감지하는 ErrorBoundary와, 비동기처리를 도와는 Suspense, 그리고 DOM 트리를 다른데서 렌더링 할 수 있는 Portal등도 참고해보시면 좋겠네요. 

Q3)
이벤트 리스너 관리 개선:
괜찮습니다. EventMap이 커져도 WeakMap와 Map 자료구조 자체가 이미 그런 데이터를 잘 보관할 수 있도록 설계된 자료구조이니까요.


Q4)
테스트 코드의 엣지 케이스 발견:

나름의 노하우가 필요한데 저도 개발을 하다보면 항상 놓치는것들이 예외처리입니다. 정상동작을 바탕으로 개발을 하더라도 데이터의 말도 안되는 조합들도 받을 수 있을까? 하는 식의 접근이 필요하죠.

또한 개발을 하다보면 이런식으로 구현을 했겠다 싶은 로직이 보이고 그러면 이런 예외는 막았을까? 저렇게도 막았을까? 하는 부분들을 생각하는 훈련이 도움이 될거에요.

결국 값을 점점더 바꿔가면서 정상범주가 아닌 동작과 데이터를 입력하는 상상력과 시야를 갖춰보는게 도움이 됩니다.


아주 수고 많으셨습니다. :)


BP 선정이유:

- 과제의 요구사항에 충실하게 작성했고,
- Fragment 등 다른 사람들에게 참고가 될 코드를 작성했으며,
- 셀프회고의 트러블 슈팅과정이 다른 참가자들에게 도움이 될 수 있을정도로 상세했기에 선정하였습니다.
