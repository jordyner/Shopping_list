import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const BarChartVisual = ({ data, t }) => {
    const tooltipStyle = {
        color: "#000", 
        backgroundColor: "rgba(255, 255, 255, 0.85)", 
        borderColor: "lightgrey"
    };

    return (
        <div className="chartContainer">
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [value, t("BarChart.itemCount")]}
                    />
                    <Bar dataKey="itemCount" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChartVisual;