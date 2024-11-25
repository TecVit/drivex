import React from "react";
import Select from "react-select";

const CustomSelect = ({ options, placeholder = "Selecione uma opção..." }) => {
  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#f0f0f0",
      borderRadius: "8px",
      border: "2px solid #ccc",
      padding: "4px",
      boxShadow: "none",
      "&:hover": {
        border: "2px solid #888",
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "8px",
      overflow: "hidden",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#e0e0e0" : "white",
      color: "black",
      padding: "10px 20px",
      cursor: "pointer",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#888",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#333",
    }),
  };

  return (
    <Select
      options={options}
      placeholder={placeholder}
      styles={customStyles}
      isSearchable={true}
    />
  );
};

export default CustomSelect;