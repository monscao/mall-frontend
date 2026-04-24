import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "context/AuthContext";
import { useCart } from "context/CartContext";
import { useI18n } from "context/I18nContext";
import { IconArrowRight, IconArrowUp, IconCart, IconClose, IconSparkles } from "components/Icons";
import { streamAgentMessage } from "services/api";

export function FloatingActions({ navigate }) {
  const { totalItems, items } = useCart();
  const { session } = useAuth();
  const { language, t } = useI18n();
  const [showTop, setShowTop] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const panelRef = useRef(null);
  const streamControllerRef = useRef(null);

  const suggestionKeys = useMemo(
    () => [
      "floating.agent.suggestionPhone",
      "floating.agent.suggestionLaptop",
      "floating.agent.suggestionGift"
    ],
    []
  );

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 280);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!agentOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setAgentOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setAgentOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [agentOpen]);

  useEffect(() => {
    return () => {
      streamControllerRef.current?.abort();
    };
  }, []);

  function stopGeneration() {
    streamControllerRef.current?.abort();
    streamControllerRef.current = null;
    setAgentLoading(false);
  }

  async function sendMessage(nextDraft) {
    const content = nextDraft.trim();

    if (!content || agentLoading) {
      return;
    }

    const history = messages
      .filter((message) => message.role === "user" || message.liveModel !== false)
      .map((message) => ({
        role: message.role,
        content: message.content
      }));

    setMessages((current) => [...current, { role: "user", content }]);
    setDraft("");
    setAgentOpen(true);

    setAgentLoading(true);
    const controller = new AbortController();
    streamControllerRef.current = controller;
    try {
      let usedLiveModel = true;
      await streamAgentMessage(
        {
          message: content,
          history,
          currentPath: `${window.location.pathname}${window.location.search}`,
          language,
          guestCartItems: items.map((item) => ({
            productName: item.productName,
            skuName: item.skuName,
            quantity: String(item.quantity),
            salePrice: item.salePrice
          }))
        },
        session?.token,
        {
          signal: controller.signal,
          onDelta(delta) {
            setMessages((current) => {
              const next = [...current];
              const last = next[next.length - 1];
              if (!last || last.role !== "assistant") {
                next.push({ role: "assistant", content: delta, liveModel: true });
                return next;
              }

              next[next.length - 1] = {
                ...last,
                content: `${last.content}${delta}`
              };
              return next;
            });
          },
          onDone(meta) {
            usedLiveModel = meta.liveModel !== false;
            setMessages((current) => {
              const next = [...current];
              const last = next[next.length - 1];
              if (!last || last.role !== "assistant") {
                return next;
              }

              next[next.length - 1] = {
                ...last,
                liveModel: meta.liveModel !== false
              };
              return next;
            });
          }
        }
      );
      if (!usedLiveModel) {
        setMessages((current) => {
          const next = [...current];
          const last = next[next.length - 1];
          if (!last || last.role !== "assistant") {
            return next;
          }
          next[next.length - 1] = { ...last, liveModel: false };
          return next;
        });
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
      setMessages((current) => [...current, { role: "assistant", content: t("floating.agent.unavailable"), liveModel: false }]);
    } finally {
      streamControllerRef.current = null;
      setAgentLoading(false);
    }
  }

  return (
    <div className="floating-actions">
      <div className={`floating-agent-shell ${agentOpen ? "is-open" : ""}`} ref={panelRef}>
        {agentOpen ? (
          <section
            aria-label={t("floating.agent.panelLabel")}
            className="floating-agent-panel"
          >
            <div className="floating-agent-panel-header">
              <div className="floating-agent-panel-title">
                <strong>{t("floating.agent.title")}</strong>
              </div>
              <button
                aria-label={t("floating.agent.close")}
                className="floating-agent-close"
                type="button"
                onClick={() => setAgentOpen(false)}
              >
                <IconClose className="button-icon-svg" />
              </button>
            </div>

            <div className="floating-agent-panel-body">
              {messages.length === 0 ? (
                <div className="floating-agent-welcome">
                  <div className="floating-agent-mark" aria-hidden="true">
                    <IconSparkles className="button-icon-svg" />
                  </div>
                  <h3>{t("floating.agent.greetingTitle")}</h3>
                  <p>{t("floating.agent.greetingBody")}</p>
                </div>
              ) : null}

              {messages.length > 0 ? (
                <div className="floating-agent-messages">
                  {messages.map((message, index) => (
                    <article
                      className={`floating-agent-message is-${message.role}`}
                      key={`${message.role}-${index}`}
                    >
                      {message.role === "user" ? <span>{t("floating.agent.you")}</span> : null}
                      <p>{message.content}</p>
                    </article>
                  ))}
                  {agentLoading ? (
                    <article className="floating-agent-message is-assistant is-thinking">
                      <span>{t("floating.agent.title")}</span>
                      <p>{t("floating.agent.thinking")}</p>
                    </article>
                  ) : null}
                </div>
              ) : (
                <div className="floating-agent-suggestions">
                  {suggestionKeys.map((key) => (
                    <button
                      className="floating-agent-suggestion"
                      key={key}
                      type="button"
                      onClick={() => sendMessage(t(key))}
                    >
                      <span className="floating-agent-suggestion-icon" aria-hidden="true">
                        <IconArrowRight className="button-icon-svg" />
                      </span>
                      <span className="floating-agent-suggestion-copy">
                        <strong>{t("floating.agent.suggestionLabel")}</strong>
                        <span>{t(key)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

            </div>

            <form
              className="floating-agent-composer"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(draft);
              }}
            >
              <textarea
                aria-label={t("floating.agent.inputLabel")}
                className="floating-agent-input"
                placeholder={t("floating.agent.placeholder")}
                rows="3"
                value={draft}
                disabled={agentLoading}
                onChange={(event) => setDraft(event.target.value)}
              />
              <button
                aria-label={agentLoading ? t("floating.agent.stop") : t("floating.agent.send")}
                className="floating-agent-send"
                type={agentLoading ? "button" : "submit"}
                onClick={agentLoading ? stopGeneration : undefined}
              >
                {agentLoading ? <IconClose className="button-icon-svg" /> : <IconArrowUp className="button-icon-svg" />}
              </button>
            </form>
          </section>
        ) : null}

        <button
          aria-expanded={agentOpen}
          aria-label={t("floating.agent.launch")}
          className="floating-agent-launcher"
          type="button"
          onClick={() => setAgentOpen((current) => !current)}
        >
          <span className="floating-agent-launcher-icon" aria-hidden="true">
            <IconSparkles className="button-icon-svg" />
          </span>
          <span>{t("floating.agent.launch")}</span>
        </button>
      </div>

      {showTop ? (
        <button
          aria-label={t("floating.backToTop")}
          className="floating-mini-button floating-top-button"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <IconArrowUp className="button-icon-svg" />
        </button>
      ) : null}

      <button
        aria-label={t("floating.cart")}
        className="floating-cart-button"
        type="button"
        onClick={() => navigate("/cart")}
      >
        <IconCart className="button-icon-svg" />
        <span>{totalItems}</span>
      </button>
    </div>
  );
}
