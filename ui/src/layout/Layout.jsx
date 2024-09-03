import { Outlet } from 'react-router-dom';
import {
  GcdsHeader,
  GcdsContainer,
  GcdsFooter,
} from '@cdssnc/gcds-components-react';
import '@cdssnc/gcds-components-react/gcds.css';
import './Layout.css';
import BreadCrumb from '../components/Breadcrumbs';
import { Link, Button } from '@radix-ui/themes';
import { useLingui } from '@lingui/react';

export default function Layout() {
  const { i18n } = useLingui();
  const target_i18n = (() => {
    if (i18n.locale === 'en') {
      return 'fr';
    } else if (i18n.locale === 'fr') {
      return 'en';
    } else {
      throw new Error(`Current locale \`${i18n.locale}\` is not supported`);
    }
  })();

  const button_text = target_i18n[0].toUpperCase() + target_i18n.slice(1);

  return (
    <div className="layout-container">
      <GcdsHeader
        skipToHref="#main-content"
        padding="150px"
        height="auto"
        lang={i18n.locale}
      >
        <div slot="toggle">
          <Button color="#333333" onClick={() => i18n.activate(target_i18n)}>
            {button_text}
          </Button>
        </div>
        <nav slot="menu" style={{ backgroundColor: '#f1f2f3' }}>
          <GcdsContainer size="xl" centered color="black">
            <div className="nav-bar">
              <Link href="/" className="title">
                Observatory
              </Link>
            </div>
          </GcdsContainer>
        </nav>
      </GcdsHeader>

      <GcdsContainer
        size="xl"
        centered
        color="black"
        style={{
          flexGrow: '1',
        }}
        padding="400"
        id="main-content"
      >
        <GcdsContainer
          centered
          style={{
            alignItems: 'center',
          }}
        ></GcdsContainer>
        <BreadCrumb />
        <Outlet />
      </GcdsContainer>

      <GcdsFooter lang={i18n.locale} />
    </div>
  );
}
