import React from 'react';
import { useLingui } from '@lingui/react';
import Locale from '../locales';

import { Button } from '@mui/material';
import { Container } from '@mui/material';

function LocaleSwitcher() {
    const { i18n } = useLingui();

    const handleLocaleChange = (newLocale: Locale) => {
        i18n.activate(newLocale);
    };

    return (
        <Container>
            <Button
                onClick={() => handleLocaleChange(Locale.ENGLISH)}
            >
                English
            </Button>
            <Button
                onClick={() => handleLocaleChange(Locale.FRENCH)}
            >
                Français
            </Button>
            {/* Add more buttons for other supported locales */}
        </Container>
    );
}

export default LocaleSwitcher;
