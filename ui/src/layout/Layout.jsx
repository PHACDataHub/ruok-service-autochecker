import { Outlet } from 'react-router-dom'
import {
  GcdsHeader,
  GcdsContainer,
  GcdsFooter,
} from '@cdssnc/gcds-components-react'
import '@cdssnc/gcds-components-react/gcds.css'
import './Layout.css'
import BreadCrumb from '../components/Breadcrumbs'
import { Link } from '@radix-ui/themes'

export default function Layout() {
  return (
    <div className="layout-container">
      <GcdsHeader skipToHref="#main-content" padding="150px" height="auto">
        <nav slot="menu" style={{ backgroundColor: '#f1f2f3' }}>
          <GcdsContainer size="xl" centered color="black">
            <div className="nav-bar">
              <Link href="/" className="title">
                Observatory - R U OK
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

      <GcdsFooter />
    </div>
  )
}
