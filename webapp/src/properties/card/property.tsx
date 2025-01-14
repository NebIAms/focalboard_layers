// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {IntlShape} from 'react-intl'

import {PropertyType, PropertyTypeEnum, FilterValueType} from '../types'

import CardProperty from './card'

export default class CardPropertyType extends PropertyType {
    Editor = CardProperty
    name = 'Card'
    type = 'card' as PropertyTypeEnum
    displayName = (intl: IntlShape) => intl.formatMessage({id: 'PropertyType.Card', defaultMessage: 'Card'})
    canFilter = true
    filterValueType = 'card' as FilterValueType
}
