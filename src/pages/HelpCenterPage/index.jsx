import { useMemo } from "react";
import { useI18n } from "context/I18nContext";

const helpContent = {
  shipping: {
    zh: {
      title: "配送说明",
      body: "常规商品支持全国配送，订单确认后通常会在 24 小时内出库。大件数码产品会根据地区安排不同的签收方式。",
      points: ["工作日 24 小时内出库", "支持订单追踪", "偏远地区配送时间会更长"]
    },
    en: {
      title: "Shipping guide",
      body: "Standard products support nationwide delivery. Orders usually leave the warehouse within 24 hours after confirmation.",
      points: ["Ships within 24 business hours", "Tracking is available", "Remote regions may take longer"]
    }
  },
  payment: {
    zh: {
      title: "支付方式",
      body: "目前支持银行卡、电子钱包和货到付款。后续可根据业务需求继续接入更完整的支付能力。",
      points: ["银行卡支付", "电子钱包", "货到付款"]
    },
    en: {
      title: "Payment methods",
      body: "We currently support bank cards, digital wallets, and cash on delivery, with room to integrate richer payment flows later.",
      points: ["Bank cards", "Digital wallets", "Cash on delivery"]
    }
  },
  support: {
    zh: {
      title: "售后支持",
      body: "你可以通过订单页、商品页和帮助中心发起售后咨询。常见问题包括换货、保修与物流异常。",
      points: ["7 天售后咨询", "保修与换货指引", "物流异常协助"]
    },
    en: {
      title: "After-sales support",
      body: "Support can be initiated from the order page, product page, and help center for warranty, exchange, and shipping issues.",
      points: ["7-day support guidance", "Warranty and exchange help", "Shipping exception assistance"]
    }
  }
};

export function HelpCenterPage({ route }) {
  const { language, t } = useI18n();
  const section = route.searchParams.get("section") || "shipping";

  const current = useMemo(() => {
    return helpContent[section]?.[language] || helpContent.shipping[language];
  }, [language, section]);

  return (
    <div className="page-stack">
      <section className="panel section-heading">
        <span>{t("help.title")}</span>
        <h2>{current.title}</h2>
        <p>{current.body}</p>
      </section>

      <section className="help-grid">
        {current.points.map((item) => (
          <article className="panel help-card" key={item}>
            <h3>{item}</h3>
            <p>{current.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
