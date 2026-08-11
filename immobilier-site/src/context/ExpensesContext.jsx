import {
    createContext,
    useCallback,
    useEffect,
    useState
} from "react";

import ExpensesService from "../services/expenses.service";

export const ExpensesContext =
    createContext();

export function ExpensesProvider({ children }) {

    const [expenses, setExpenses] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadExpenses = useCallback(
        async () => {

            try {

                setLoading(true);
                setError("");

                const data =
                    await ExpensesService.getAll();

                setExpenses(data);

            }

            catch (err) {

                console.error(err);

                setError(
                    "Impossible de charger les dépenses."
                );

            }

            finally {

                setLoading(false);

            }

        },
        []
    );

    useEffect(() => {

        loadExpenses();

    }, [loadExpenses]);

    const addExpense = async (data) => {

        const expense =
            await ExpensesService.create(data);

        setExpenses(prev => [
            expense,
            ...prev
        ]);

        return expense;

    };

    const updateExpense = async (
        id,
        data
    ) => {

        const expense =
            await ExpensesService.update(
                id,
                data
            );

        setExpenses(prev =>
            prev.map(item =>
                item.id === expense.id
                    ? expense
                    : item
            )
        );

        return expense;

    };

    const deleteExpense = async (id) => {

        await ExpensesService.delete(id);

        setExpenses(prev =>
            prev.filter(
                item => item.id !== id
            )
        );

    };

    return (

        <ExpensesContext.Provider
            value={{
                expenses,
                loading,
                error,
                reloadExpenses: loadExpenses,
                addExpense,
                updateExpense,
                deleteExpense
            }}
        >

            {children}

        </ExpensesContext.Provider>

    );

}