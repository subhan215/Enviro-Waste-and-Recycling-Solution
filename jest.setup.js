import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
    a: ({ children, ...props }) => <a {...props}>{children}</a>,
    img: (props) => <img {...props} />,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useAnimation: () => ({
    start: jest.fn(),
    set: jest.fn(),
  }),
  useInView: () => true,
}));

// Mock PubNub
jest.mock('pubnub', () => {
  return jest.fn().mockImplementation(() => ({
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    publish: jest.fn(),
    fetchMessages: jest.fn().mockResolvedValue({ channels: {} }),
  }));
});

// Mock react-redux
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
process.env.JWT_SECRET = 'test-secret';
process.env.PUBNUB_PUBLISH_KEY = 'test-publish-key';
process.env.PUBNUB_SUBSCRIBE_KEY = 'test-subscribe-key';

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('act(...)'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global test utilities
global.mockFetch = (data, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
    })
  );
};

global.mockFetchError = (error) => {
  global.fetch = jest.fn(() => Promise.reject(error));
};
