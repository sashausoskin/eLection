import { useTranslation } from 'react-i18next'
import icon from '/img/icon.svg'
import languageIcon from '/img/icons/language.svg'

/**
 * A bar that is showed at the top of the screen at all times. Is currently used to show the logo and control the language of the site.
 */
const Topbar = () => {
    const {i18n} = useTranslation()

    return <div className='topbar'>
        <img className='mainIcon' width={50} height={50} src={icon} />
        <div className='languageSelectionContainer'>
            <img width={30} src={languageIcon} />
            <select onChange={(e) => i18n.changeLanguage(e.target.value)} defaultValue={i18n.resolvedLanguage} data-testid={'language-selector'} name='language' id='language'>
                {i18n.languages.concat().sort().map((language) => (
                    <option key={language} value={language} onSelect={() => i18n.changeLanguage(language)}>{language.toUpperCase()}</option>
                ))}
            </select>
        </div>
    </div>
}

export default Topbar