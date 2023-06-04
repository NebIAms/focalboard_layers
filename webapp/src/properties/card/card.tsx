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

    // TODO: 
    // 1. If you go into a card, add another card, then exit, and go into another card, then back to the other card, the card will be gone
    //    The values is somehow being deleted from other cards, even though the values are NOT shared
    // 2. group cards, prevent adding from groups

    const values = Array.isArray(propertyValue) && propertyValue.length > 0 ? propertyValue.map((v) => propertyTemplate.options.find((o) => o!.id === v)).filter((v): v is IPropertyOption => Boolean(v)) : []

    Array.isArray(cards) && cards.length > 0 ? cards.map((currentCard) => 
    {
        // not sure if these are correct, but should be something sorta close
        const option: IPropertyOption = {
            id: currentCard.id,
            value: currentCard.title,
            color: '255, 255, 255'
        };

        // Add if not found
        // Don't add own card
        if ((propertyTemplate.options.find((o) => o.id === currentCard.id) === undefined) && (currentCard.id !== card.id)) {
            mutator.insertPropertyOption(board.id, board.cardProperties, propertyTemplate, option, 'add property option').then(() => {
                mutator.changePropertyValue(board.id, card, propertyTemplate.id, values.map((v: IPropertyOption) => v.id))
            })
        }
    }) : [];
    
    // TODO: this deletes the value from other cards too
    //       this other property deletion does not do any searching, only for the current card
    //       it actually updates the whole board
    // delete self card from options
    // var selfOption = propertyTemplate.options.find((o) => o.id === card.id)
    // if (selfOption !== undefined) {
    //     mutator.deletePropertyOption(board.id, board.cardProperties, propertyTemplate, selfOption)
    //     .then(() => {
    //        mutator.changePropertyValue(board.id, card, propertyTemplate.id, values.map((v: IPropertyOption) => v.id))
    //     })
    // }

    // delete self, but only in values, NOT the option
    // this filters for everything except self
    mutator.changePropertyValue(board.id, card, propertyTemplate.id, values.filter(((v): v is IPropertyOption => Boolean(v.id !== card.id))).map((v: IPropertyOption) => v.id))

    //mutator.insertPropertyTemplate


    // // delete cards that do not exist in the board
    // propertyTemplate.options.map((o) => {
    //     if (cards.find((currentCard) => (currentCard.id === o.id)) === undefined) {
    //         mutator.deletePropertyOption(board.id, board.cardProperties, propertyTemplate, o).then(() => {
    //             mutator.changePropertyValue(board.id, card, propertyTemplate.id, values.map((v: IPropertyOption) => v.id))
    //         })
    //     }
    // })

    const onChange = useCallback((newValue) => mutator.changePropertyValue(board.id, card, propertyTemplate.id, newValue), [board.id, card, propertyTemplate])

    // this actually works, so keep it
    const onChangeColor = useCallback((option: IPropertyOption, colorId: string) => mutator.changePropertyOptionColor(board.id, board.cardProperties, propertyTemplate, option, colorId), [board, propertyTemplate])
    
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
            options={propertyTemplate.options}
            value={values}
            onChange={onChange}
            onChangeColor={onChangeColor}
            onDeleteOption={() => {}} // do no allow deletion
            onDeleteValue={(valueToRemove) => onDeleteValue(valueToRemove, values)}
            onCreate={() => {}} // do not allow creation
            onBlur={() => setOpen(false)}
        />
    )
}
export default CardProperty







