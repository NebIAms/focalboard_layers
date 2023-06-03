// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useCallback} from 'react'
import {useIntl} from 'react-intl'

import mutator from '../../mutator'
import {Utils, IDType} from '../../utils'
import {PropertyProps} from '../types'
import {useAppSelector} from '../../store/hooks'
import {getCurrentViewCardsSortedFilteredAndGrouped} from '../../store/cards'
import ValueSelector from '../../widgets/valueSelector'
import {IPropertyOption} from '../../blocks/board'
import {Card} from '../../blocks/card'
import Label from '../../widgets/label'

const CardProperty = (props: PropertyProps): JSX.Element => {
    const {propertyTemplate, propertyValue, board, card} = props
    const [open, setOpen] = useState(false)
    const isEditable = !props.readOnly && Boolean(board)
    const intl = useIntl()
    const emptyDisplayValue = props.showEmptyPlaceholder ? intl.formatMessage({id: 'PropertyValueElement.empty', defaultMessage: 'Empty'}) : ''

    const cards: Card[] = useAppSelector(getCurrentViewCardsSortedFilteredAndGrouped)

    // TODO: elimate cards already selected, this card, and maybe cards that selected this card (to prevent loops)

    // TODO: cannot add items, no idea how. Maybe it's one of the other callbacks? Maybe it's the CreatableSelect?
    //    having a hard time finding documentation on CreatableSelect, thanks react

    const options: IPropertyOption[] = Array.isArray(cards) && cards.length > 0 ? cards.map((card) => 
    {
        // not sure if these are correct, but should be something sorta close
        return {
            id: card.id,
            value: card.title,
            color: '255, 255, 255'
        }
    }) : []

    const onCreateValue = useCallback((newValue: string, currentValues: IPropertyOption[]) => {
        const option: IPropertyOption = {
            id: Utils.createGuid(IDType.BlockID),
            value: newValue,
            color: 'propColorDefault',
        }
        currentValues.push(option)
        mutator.insertPropertyOption(board.id, board.cardProperties, propertyTemplate, option, 'add property option').then(() => {
            mutator.changePropertyValue(board.id, card, propertyTemplate.id, currentValues.map((v: IPropertyOption) => v.id))
        })
    }, [board, board.id, card, propertyTemplate])

    const values = Array.isArray(propertyValue) && propertyValue.length > 0 ? propertyValue.map((v) => propertyTemplate.options.find((o) => o!.id === v)).filter((v): v is IPropertyOption => Boolean(v)) : []

    const onChange = useCallback((newValue) => mutator.changePropertyValue(board.id, card, propertyTemplate.id, newValue), [board.id, card, propertyTemplate])

    const onChangeColor = useCallback((option: IPropertyOption, colorId: string) => mutator.changePropertyOptionColor(board.id, board.cardProperties, propertyTemplate, option, colorId), [board, propertyTemplate])
    
    const onDeleteOption = useCallback((option: IPropertyOption) => mutator.deletePropertyOption(board.id, board.cardProperties, propertyTemplate, option), [board, propertyTemplate])

    const onDeleteValue = useCallback((valueToDelete: IPropertyOption, currentValues: IPropertyOption[]) => {
        const newValues = currentValues.
            filter((currentValue) => currentValue.id !== valueToDelete.id).
            map((currentValue) => currentValue.id)
        mutator.changePropertyValue(board.id, card, propertyTemplate.id, newValues)
    }, [board.id, card, propertyTemplate.id])

    if (!isEditable || !open) {
        return (
            <div
                className={props.property.valueClassName(!isEditable)}
                tabIndex={0}
                data-testid='multiselect-non-editable'
                onClick={() => setOpen(true)}
            >
                {values.map((v) => (
                    <Label
                        key={v.id}
                        color={v.color}
                    >
                        {v.value}
                    </Label>
                ))}
                {values.length === 0 && (
                    <Label
                        color='empty'
                    >{emptyDisplayValue}</Label>
                )}
            </div>
        )
    }

    return (
        <ValueSelector
            isMulti={true}
            emptyValue={emptyDisplayValue}
            options={options}
            value={values}
            onChange={onChange}
            onChangeColor={onChangeColor} // do no allow changing color
            onDeleteOption={onDeleteOption} // do no allow deletion
            onDeleteValue={(valueToRemove) => onDeleteValue(valueToRemove, values)}
            onCreate={(newValue) => onCreateValue(newValue, values)} // do not allow creation
            onBlur={() => setOpen(false)}
        />
    )
}
export default CardProperty







