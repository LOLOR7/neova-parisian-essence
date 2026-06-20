import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { ServicesShowcase } from "@/components/site/ServicesShowcase";
import { useI18n } from "@/i18n/I18nProvider";

const Services = () => {
  const { t } = useI18n();
  return (
    <SiteShell>
      <PageHero eyebrow={t.common.eyebrow.services} index="III" title={t.services.title} />
      <ServicesShowcase
        eyebrow={t.common.eyebrow.services}
        title={t.home.servicesTitle}
        subtitle={t.home.servicesSubtitle}
        items={t.home.coreServices}
        visualIndices={[9, 0, 7, 8]}
      />
    </SiteShell>
  );
};

export default Services;
