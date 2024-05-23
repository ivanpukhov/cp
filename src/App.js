import React, {useEffect, useState} from 'react';
import data from './data.json';
import './PriceCalculator.css';

const quantities = [
    50, 100, 200, 300, 400, 500, 1000, 1500, 2000, 2500, 3000,
    3500, 4000, 4500, 5000, 6000, 7000, 8000, 9000, 10000
];

const getDiscountedPrice = (weight, quantity, side) => {
    if (!weight.discounts) return weight.price;
    if (quantity <= 200) return weight.price;
    if (quantity <= 1000) return weight.discounts[0];
    if (quantity <= 5000) return weight.discounts[1];
    if (quantity <= 10000) return weight.discounts[2];
    return weight.discounts[3];
};

const findClosestQuantity = (desiredQuantity) => {
    return quantities.reduce((prev, curr) => Math.abs(curr - desiredQuantity) < Math.abs(prev - desiredQuantity) ? curr : prev);
};

const plans = [
    {
        name: 'Эконом',
        printing: data.inkjet_printing,
        paperType: data.inkjet_printing.glossy_paper,
        side: data.inkjet_printing.glossy_paper.single_sided,
        weight: data.inkjet_printing.glossy_paper.single_sided["120gr"],
        print: "Струйная",
        paper: "Глянцевая",
        format: "Односторонняя",
        size: "120гр",
    },
    {
        name: 'Стандарт',
        printing: data.digital_printing,
        paperType: data.digital_printing.supercalendered,
        side: data.digital_printing.supercalendered.single_sided,
        weight: data.digital_printing.supercalendered.single_sided["200gr"],
        print: "Цифровая",
        paper: "Суперкаландрированная",
        format: "Односторонняя",
        size: "200гр",
    },
    {
        name: 'Премиум',
        printing: data.digital_printing,
        paperType: data.digital_printing.coated_gloss_satin,
        side: data.digital_printing.coated_gloss_satin.double_sided,
        weight: data.digital_printing.coated_gloss_satin.double_sided["300gr"],
        print: "Цифровая",
        paper: "Мелованная (глянец, сатин)",
        format: "Двусторонняя",
        size: "300гр",
    },
];

const PriceCalculator = () => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [customSelection, setCustomSelection] = useState(false);
    const [selectedPrinting, setSelectedPrinting] = useState(null);
    const [selectedPaperType, setSelectedPaperType] = useState(null);
    const [selectedSide, setSelectedSide] = useState(null);
    const [selectedWeight, setSelectedWeight] = useState(null);
    const [selectedLamination, setSelectedLamination] = useState(null);
    const [selectedFoil, setSelectedFoil] = useState(null);
    const [selectedCorners, setSelectedCorners] = useState(null);
    const [selectedQuantity, setSelectedQuantity] = useState(quantities[0]);
    const [price, setPrice] = useState(null);
    const [budget, setBudget] = useState('');
    const [desiredQuantity, setDesiredQuantity] = useState('');
    const [showCustomOptions, setShowCustomOptions] = useState(false);

    useEffect(() => {
        if (customSelection || selectedPlan) calculatePrice();
    }, [selectedWeight, selectedLamination, selectedFoil, selectedCorners, selectedQuantity]);

    const handleSelection = (setter, resetters = []) => (value) => {
        setter(value);
        resetters.forEach(reset => reset());
    };

    const resetSelections = () => {
        setSelectedPaperType(null);
        setSelectedSide(null);
        setSelectedWeight(null);
        setSelectedLamination(null);
        setSelectedFoil(null);
        setSelectedCorners(null);
        setPrice(null);
    };

    const calculatePrice = () => {
        if (!selectedWeight || !selectedSide) return;
        try {
            let basePrice = getDiscountedPrice(selectedWeight, selectedQuantity, selectedSide.alias) * selectedQuantity;

            if (selectedLamination) basePrice += selectedLamination[selectedSide.alias === 'Односторонняя' ? 'single_sided' : 'double_sided'].price * selectedQuantity;
            if (selectedFoil) basePrice += selectedFoil[selectedSide.alias === 'Односторонняя' ? 'single_sided' : 'double_sided'].price * selectedQuantity;
            if (selectedCorners) basePrice += selectedCorners.price * selectedQuantity;

            setPrice(basePrice);
        } catch (error) {
            console.error("Error calculating price:", error);
        }
    };

    const handleQuantityChange = (quantity) => {
        setSelectedQuantity(quantity);
    };

    const handlePlanSelection = (plan) => {
        setSelectedPlan(plan);
        setSelectedPrinting(plan.printing);
        setSelectedPaperType(plan.paperType);
        setSelectedSide(plan.side);
        setSelectedWeight(plan.weight);
        setCustomSelection(false);
        setSelectedQuantity(quantities[0]); // Reset quantity to default
    };

    const handleCustomSelection = () => {
        setCustomSelection(true);
        setSelectedPlan(null);
        resetSelections();
        setSelectedQuantity(quantities[0]); // Reset quantity to default
    };

    const optimizeSelection = () => {
        const budgetNum = parseFloat(budget);
        const quantityNum = parseInt(desiredQuantity, 10);

        if (isNaN(budgetNum) || isNaN(quantityNum) || budgetNum <= 0 || quantityNum <= 0) {
            alert("Введите корректные значения бюджета и количества визиток");
            return;
        }

        const closestQuantity = findClosestQuantity(quantityNum);

        let optimalPlan;
        if (budgetNum / closestQuantity < 10) {
            optimalPlan = plans[0];
        } else if (budgetNum / closestQuantity < 20) {
            optimalPlan = plans[1];
        } else {
            optimalPlan = plans[2];
        }

        handlePlanSelection(optimalPlan);
        setSelectedQuantity(closestQuantity);
    };

    const handleShowCustomOptions = () => {
        setShowCustomOptions(true);
    };

    return (
        <div className="calculator">
            <h1>Price Calculator</h1>
            <div className="section">
                <h2>Оптимизатор параметров</h2>
                <div className="form">
                    <label>
                        Бюджет:
                        <input
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                        />
                    </label>
                    <label>
                        Количество визиток:
                        <input
                            type="number"
                            value={desiredQuantity}
                            onChange={(e) => setDesiredQuantity(e.target.value)}
                        />
                    </label>
                    <button onClick={optimizeSelection}>Подобрать </button>

                </div>
            </div>
            <div className="section">
                <h2>Лучшие решения для Вас:</h2>
                <div className="plans">
                    {plans.map((plan) => (
                        <button
                            key={plan.name}
                            onClick={() => handlePlanSelection(plan)}
                            className={selectedPlan && selectedPlan.name === plan.name ? 'selected' : ''}
                        >
                            <p className="plan__title">
                                {plan.name}
                            </p>
                                <p>Тип печати: <b>{plan.print}</b></p>
                                <p>Тип бумаги: <b>{plan.paper}</b></p>
                                <p>Стороны: <b>{plan.format}</b></p>
                                <p>Граммовка: <b>{plan.size}</b></p>

                        </button>
                    ))}
                    <button
                        onClick={handleCustomSelection}
                        className={customSelection ? 'selected' : '' + 'ozin'}
                    >
                        <span className="plan__title">Кастом</span>
                        <p>Создайте уникальный набор параметров для ваших визиток</p>


                    </button>
                </div>
            </div>

            {selectedPlan && (
                <button onClick={handleShowCustomOptions}>
                    Уточнить
                </button>
            )}

            {customSelection && (
                <>
                    <div className="section">
                        <h2>Тип печати</h2>
                        {Object.keys(data).map((key) => (
                            key !== "protective_lamination" && key !== "foil_stamping" && key !== "corner_rounding" &&
                            <button
                                key={key}
                                onClick={handleSelection(
                                    () => setSelectedPrinting(data[key]),
                                    [resetSelections]
                                )}
                                className={selectedPrinting && selectedPrinting.alias === data[key].alias ? 'selected' : ''}
                            >
                                {data[key].alias}
                            </button>
                        ))}
                    </div>

                    {selectedPrinting && (
                        <div className="section">
                            <h2>Тип бумаги</h2>
                            {Object.keys(selectedPrinting).filter(key => key !== 'alias').map((key) => (
                                <button
                                    key={key}
                                    onClick={handleSelection(
                                        () => setSelectedPaperType(selectedPrinting[key]),
                                        [() => setSelectedSide(null), () => setSelectedWeight(null), () => setSelectedLamination(null), () => setSelectedFoil(null), () => setSelectedCorners(null), () => setPrice(null)]
                                    )}
                                    className={selectedPaperType && selectedPaperType.alias === selectedPrinting[key].alias ? 'selected' : ''}
                                >
                                    {selectedPrinting[key].alias}
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedPaperType && (
                        <div className="section">
                            <h2>Количество сторон</h2>
                            {Object.keys(selectedPaperType).filter(key => key !== 'alias').map((key) => (
                                <button
                                    key={key}
                                    onClick={handleSelection(
                                        () => setSelectedSide(selectedPaperType[key]),
                                        [() => setSelectedWeight(null), () => setSelectedLamination(null), () => setSelectedFoil(null), () => setSelectedCorners(null), () => setPrice(null)]
                                    )}
                                    className={selectedSide && selectedSide.alias === selectedPaperType[key].alias ? 'selected' : ''}
                                >
                                    {selectedPaperType[key].alias}
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedSide && (
                        <div className="section">
                            <h2>Граммовка</h2>
                            {Object.keys(selectedSide).filter(key => key !== 'alias').map((key) => (
                                <button
                                    key={key}
                                    onClick={handleSelection(
                                        () => setSelectedWeight(selectedSide[key]),
                                        [() => setSelectedLamination(null), () => setSelectedFoil(null), () => setSelectedCorners(null), () => setPrice(null)]
                                    )}
                                    className={selectedWeight && selectedWeight.alias === selectedSide[key].alias ? 'selected' : ''}
                                >
                                    {selectedSide[key].alias}
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedWeight && (
                        <>
                            <div className="section">
                                <h2>Ламинирование</h2>
                                {Object.keys(data.protective_lamination).filter(key => data.protective_lamination[key]).map((key) => (
                                    <button
                                        key={key}
                                        onClick={handleSelection(
                                            () => setSelectedLamination(data.protective_lamination[key]),
                                            [() => setPrice(null)]
                                        )}
                                        className={selectedLamination && selectedLamination.alias === data.protective_lamination[key].alias ? 'selected' : ''}
                                    >
                                        {data.protective_lamination[key].alias}
                                    </button>
                                ))}
                            </div>

                            <div className="section">
                                <h2>Фольгирование</h2>
                                {Object.keys(data.foil_stamping).filter(key => data.foil_stamping[key]).map((key) => (
                                    <button
                                        key={key}
                                        onClick={handleSelection(
                                            () => setSelectedFoil(data.foil_stamping[key]),
                                            [() => setPrice(null)]
                                        )}
                                        className={selectedFoil && selectedFoil.alias === data.foil_stamping[key].alias ? 'selected' : ''}
                                    >
                                        {data.foil_stamping[key].alias}
                                    </button>
                                ))}
                            </div>

                            <div className="section">
                                <h2>Скругление углов</h2>
                                {Object.keys(data.corner_rounding).filter(key => data.corner_rounding[key]).map((key) => (
                                    <button
                                        key={key}
                                        onClick={handleSelection(
                                            () => setSelectedCorners(data.corner_rounding[key]),
                                            [() => setPrice(null)]
                                        )}
                                        className={selectedCorners && selectedCorners.alias === data.corner_rounding[key].alias ? 'selected' : ''}
                                    >
                                        {data.corner_rounding[key].alias}
                                    </button>
                                ))}
                            </div>

                            <div className="section">
                                <h2>Количество</h2>
                                <div className="quantity">
                                    {quantities.map((quantity) => (
                                        <button
                                            key={quantity}
                                            onClick={() => handleQuantityChange(quantity)}
                                            className={selectedQuantity === quantity ? 'selected' : ''}
                                        >
                                            {quantity}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {price !== null && (
                                <div className="total-price">
                                    <h2>Итоговая цена: {price} тг</h2>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {showCustomOptions && (
                <>
                    <div className="section">
                        <h2>Создайте свой набор параметров</h2>
                        <div className="section">
                            <h2>Тип печати</h2>
                            {Object.keys(data).map((key) => (
                                key !== "protective_lamination" && key !== "foil_stamping" && key !== "corner_rounding" &&
                                <button
                                    key={key}
                                    onClick={handleSelection(
                                        () => setSelectedPrinting(data[key]),
                                        [resetSelections]
                                    )}
                                    className={selectedPrinting && selectedPrinting.alias === data[key].alias ? 'selected' : ''}
                                >
                                    {data[key].alias}
                                </button>
                            ))}
                        </div>

                        {selectedPrinting && (
                            <div className="section">
                                <h2>Тип бумаги</h2>
                                {Object.keys(selectedPrinting).filter(key => key !== 'alias').map((key) => (
                                    <button
                                        key={key}
                                        onClick={handleSelection(
                                            () => setSelectedPaperType(selectedPrinting[key]),
                                            [() => setSelectedSide(null), () => setSelectedWeight(null), () => setSelectedLamination(null), () => setSelectedFoil(null), () => setSelectedCorners(null), () => setPrice(null)]
                                        )}
                                        className={selectedPaperType && selectedPaperType.alias === selectedPrinting[key].alias ? 'selected' : ''}
                                    >
                                        {selectedPrinting[key].alias}
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedPaperType && (
                            <div className="section">
                                <h2>Количество сторон</h2>
                                {Object.keys(selectedPaperType).filter(key => key !== 'alias').map((key) => (
                                    <button
                                        key={key}
                                        onClick={handleSelection(
                                            () => setSelectedSide(selectedPaperType[key]),
                                            [() => setSelectedWeight(null), () => setSelectedLamination(null), () => setSelectedFoil(null), () => setSelectedCorners(null), () => setPrice(null)]
                                        )}
                                        className={selectedSide && selectedSide.alias === selectedPaperType[key].alias ? 'selected' : ''}
                                    >
                                        {selectedPaperType[key].alias}
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedSide && (
                            <div className="section">
                                <h2>Граммовка</h2>
                                {Object.keys(selectedSide).filter(key => key !== 'alias').map((key) => (
                                    <button
                                        key={key}
                                        onClick={handleSelection(
                                            () => setSelectedWeight(selectedSide[key]),
                                            [() => setSelectedLamination(null), () => setSelectedFoil(null), () => setSelectedCorners(null), () => setPrice(null)]
                                        )}
                                        className={selectedWeight && selectedWeight.alias === selectedSide[key].alias ? 'selected' : ''}
                                    >
                                        {selectedSide[key].alias}
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedWeight && (
                            <>
                                <div className="section">
                                    <h2>Ламинирование</h2>
                                    {Object.keys(data.protective_lamination).filter(key => data.protective_lamination[key]).map((key) => (
                                        <button
                                            key={key}
                                            onClick={handleSelection(
                                                () => setSelectedLamination(data.protective_lamination[key]),
                                                [() => setPrice(null)]
                                            )}
                                            className={selectedLamination && selectedLamination.alias === data.protective_lamination[key].alias ? 'selected' : ''}
                                        >
                                            {data.protective_lamination[key].alias}
                                        </button>
                                    ))}
                                </div>

                                <div className="section">
                                    <h2>Фольгирование</h2>
                                    {Object.keys(data.foil_stamping).filter(key => data.foil_stamping[key]).map((key) => (
                                        <button
                                            key={key}
                                            onClick={handleSelection(
                                                () => setSelectedFoil(data.foil_stamping[key]),
                                                [() => setPrice(null)]
                                            )}
                                            className={selectedFoil && selectedFoil.alias === data.foil_stamping[key].alias ? 'selected' : ''}
                                        >
                                            {data.foil_stamping[key].alias}
                                        </button>
                                    ))}
                                </div>

                                <div className="section">
                                    <h2>Скругление углов</h2>
                                    {Object.keys(data.corner_rounding).filter(key => data.corner_rounding[key]).map((key) => (
                                        <button
                                            key={key}
                                            onClick={handleSelection(
                                                () => setSelectedCorners(data.corner_rounding[key]),
                                                [() => setPrice(null)]
                                            )}
                                            className={selectedCorners && selectedCorners.alias === data.corner_rounding[key].alias ? 'selected' : ''}
                                        >
                                            {data.corner_rounding[key].alias}
                                        </button>
                                    ))}
                                </div>

                                <div className="section">
                                    <h2>Количество</h2>
                                    <div className="quantity">
                                        {quantities.map((quantity) => (
                                            <button
                                                key={quantity}
                                                onClick={() => handleQuantityChange(quantity)}
                                                className={selectedQuantity === quantity ? 'selected' : ''}
                                            >
                                                {quantity}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {price !== null && (
                                    <div className="total-price">
                                        <h2>Итоговая цена: {price} тг</h2>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default PriceCalculator;
