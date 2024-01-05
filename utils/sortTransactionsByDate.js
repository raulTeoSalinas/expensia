const sortTransactionsByDate = (transactions) => {
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
  
      // Ordenar por fecha
      if (dateB - dateA !== 0) {
        return dateB - dateA;
      }
  
      // Ordenar por ID si tienen la misma fecha
      return b.id - a.id;
    });
  };

export default sortTransactionsByDate;